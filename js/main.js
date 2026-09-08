// UI remains usable even if the CDN or WebGL is unavailable. Dynamic imports
// deliberately allow a friendly fallback instead of a blank hero on failure.
const about = document.querySelector('#about');
document.querySelector('#about-open').addEventListener('click', () => about.showModal());
about.addEventListener('click', (event) => {
  const rect = about.getBoundingClientRect();
  if (event.target === about && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) about.close();
});

const status = document.querySelector('#status');
const fallback = document.querySelector('#fallback');
const motionButton = document.querySelector('#motion');
const perspectiveButton = document.querySelector('#perspective');
const materialButtons = [...document.querySelectorAll('[data-material]')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;

try {
  const THREE = await import('three');
  const canvas = document.querySelector('#webgl');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // Exposure controls the final image. Start near 1; cranking it up can wash
  // away dark chrome. Make the reflection panels brighter first instead.
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0a0a');
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);

  // PROCEDURAL STUDIO ENVIRONMENT — no HDR download or local assets needed.
  // Metallic surfaces need something bright to reflect. Lights alone give
  // tiny highlights; these emissive softboxes create long, elegant streaks.
  // The studio is baked once with PMREM and never added to the visible scene.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#111411');
  const panels = [];
  function softbox(width, height, x, y, z, color, strength) {
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    material.color.multiplyScalar(strength);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    studio.add(panel);
    panels.push(panel);
  }
  // Wider panels = broad silky reflections; narrow panels = crisp rims.
  // Keep most panels neutral for chrome. The pale green right-hand strip
  // ties the edge reflections to the UI accent; use white for neutral silver.
  softbox(3, 7, -4, 2, 3, '#ffffff', 5);
  softbox(2, 6, 4, 1, 1, '#e3efcc', 4);
  softbox(5, 2, 0, 5, -1, '#ffffff', 6);
  softbox(1.2, 5, -2, -1, -4, '#c6d3e0', 3);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, 0.04, 0.1, 40);
  scene.environment = environment.texture;
  panels.forEach(panel => { panel.geometry.dispose(); panel.material.dispose(); });
  pmrem.dispose();

  // MATERIAL RECIPES — an art-directed starting point, not extracted values
  // from nirnor.jp. Match the reference by tuning panels, then roughness,
  // then exposure. Exact appearance depends on geometry and environment too.
  const recipes = {
    chrome: { color: '#858b82', metalness: 0.96, roughness: 0.18, transmission: 0.08, thickness: 0.8, ior: 1.5, envMapIntensity: 1.65 },
    glass: { color: '#c9d4bd', metalness: 0.02, roughness: 0.08, transmission: 0.96, thickness: 1.4, ior: 1.48, envMapIntensity: 1.45 }
  };
  const material = new THREE.MeshPhysicalMaterial({
    ...recipes.chrome,
    // metalness: 0.9–1 produces chrome. For real dielectric glass, use 0–0.05;
    // high metalness suppresses transmission, so simply increasing the
    // transmission of a fully metallic material does NOT make clear glass.
    // roughness: 0.06–0.12 gives sharp glass; 0.16–0.25 softens chrome.
    // clearcoat is an independent glossy outer layer; its roughness should
    // stay low to preserve narrow highlights without polishing the base.
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    // Keep opacity at 1 and transparent false: physical transmission handles
    // refraction. thickness controls the optical travel distance; ior around
    // 1.45–1.52 feels like glass. Higher ior creates stronger distortion.
    attenuationColor: new THREE.Color('#a9ba96'),
    attenuationDistance: 4,
    // Shorter attenuationDistance creates denser tinted glass. Avoid a nearly
    // black base color for glass; it will absorb most of the transmitted light.
    opacity: 1
  });
  const mobile = matchMedia('(max-width: 760px)');
  const geometry = new THREE.TorusKnotGeometry(1.08, 0.37, mobile.matches ? 160 : 240, mobile.matches ? 24 : 40, 2, 3);
  const mesh = new THREE.Mesh(geometry, material);
  // A parent group separates eased pointer movement from continuous rotation.
  const sculpture = new THREE.Group();
  sculpture.add(mesh);
  scene.add(sculpture);

  // DIRECT LIGHTS — key at upper left; cool/warm points pick out the edges.
  // Move the key sideways for more dramatic contrast. Keep ambient low or
  // the glass/chrome becomes flat. Point intensity follows inverse-square
  // falloff: moving a point closer changes brightness as well as rim width.
  const ambient = new THREE.AmbientLight('#dce2d4', 0.22);
  const key = new THREE.DirectionalLight('#ffffff', 3.5);
  key.position.set(-3, 5, 4);
  const rim = new THREE.PointLight('#d8edb6', 45, 18, 2);
  rim.position.set(4, 1, 2);
  const coolRim = new THREE.PointLight('#b4c8df', 22, 18, 2);
  coolRim.position.set(-3, -1, -2);
  scene.add(ambient, key, rim, coolRim);

  // A dim backdrop behind the glass gives physical transmission something
  // to refract, while the surrounding scene stays close to the page black.
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: '#11150f' }));
  backdrop.position.z = -5;
  scene.add(backdrop);

  const pointer = new THREE.Vector2();
  const easedPointer = new THREE.Vector2();
  let paused = reduceMotion.matches;
  let contextLost = false;
  let elapsed = 0;
  let lastTime = 0;
  let frame = 0;
  let view = 0;
  let targetView = 0;
  let baseX = 0;
  let baseY = 0;
  let entrance;
  let heroVisible = true;

  function pose() {
    sculpture.rotation.set(easedPointer.y * 0.15, easedPointer.x * 0.24, -0.15);
    sculpture.position.set(baseX + easedPointer.x * 0.12, baseY - easedPointer.y * 0.09 + Math.sin(elapsed * 0.6) * 0.055, 0);
    mesh.rotation.set(0.45 + elapsed * 0.085 + view * 0.4, elapsed * 0.12 + view, 0.2 + Math.sin(elapsed * 0.2) * 0.15);
  }
  function draw() { pose(); renderer.render(scene, camera); }
  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    // Fit a bounding sphere against BOTH axes, so narrow phones and short
    // landscape windows cannot accidentally crop the whole sculpture.
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const fitHeight = 2.15 / Math.sin(halfFov);
    const fitWidth = 2.15 / Math.sin(Math.atan(Math.tan(halfFov) * camera.aspect));
    camera.position.z = Math.max(8.6, fitHeight, fitWidth * (mobile.matches ? 1.06 : 0.9));
    baseX = mobile.matches ? 0.18 : 1.18;
    baseY = mobile.matches ? -0.65 : 0.1;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    if (!contextLost) draw();
  }
  function animate(now) {
    frame = 0;
    if (paused || document.hidden || contextLost || !heroVisible) return;
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
    lastTime = now;
    elapsed += delta;
    // Frame-rate-independent lerp: equally smooth at 30, 60, and 120 Hz.
    const blend = 1 - Math.exp(-3.6 * delta);
    easedPointer.lerp(pointer, blend);
    view = THREE.MathUtils.lerp(view, targetView, blend);
    draw();
    frame = requestAnimationFrame(animate);
  }
  function schedule() {
    if (!frame && !paused && !document.hidden && !contextLost && heroVisible) {
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    }
  }
  // The page now contains more studies: stop the hero loop while it is covered
  // by the following sections, rather than running three scenes continuously.
  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting && entry.intersectionRatio >= 0.001;
    if (!heroVisible) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  }, { threshold: 0.001 });
  heroObserver.observe(document.querySelector('.page'));
  function syncMotion() {
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Resume animation' : 'Pause animation');
    document.querySelector('#motion-label').textContent = paused ? 'Resume' : 'Pause';
    document.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
    cancelAnimationFrame(frame);
    frame = 0;
    schedule();
  }
  window.addEventListener('pointermove', event => {
    if (paused || reduceMotion.matches || !heroVisible || event.pointerType === 'touch') return;
    pointer.set(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => pointer.set(0, 0));
  window.addEventListener('blur', () => pointer.set(0, 0));
  window.addEventListener('resize', resize, { passive: true });
  motionButton.addEventListener('click', () => {
    paused = !paused;
    // Complete the text reveal when pausing so the heading cannot get
    // stranded at partial opacity during its entrance animation.
    if (paused) entrance?.progress(1).kill();
    syncMotion();
  });
  reduceMotion.addEventListener('change', () => {
    paused = reduceMotion.matches;
    pointer.set(0, 0);
    easedPointer.set(0, 0);
    if (paused) entrance?.progress(1).kill();
    syncMotion();
    if (!contextLost) draw();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; entrance?.pause(); }
    else { if (!paused) entrance?.resume(); schedule(); }
  });
  perspectiveButton.addEventListener('click', () => {
    targetView += Math.PI * 0.65;
    if (paused || reduceMotion.matches) { view = targetView; draw(); }
  });
  materialButtons.forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.material;
    const recipe = recipes[name];
    material.color.set(recipe.color);
    for (const [key, value] of Object.entries(recipe)) if (key !== 'color') material[key] = value;
    material.needsUpdate = true;
    materialButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#material-caption').textContent = name === 'chrome' ? '01 / Dark chrome' : '02 / Smoked glass';
    draw();
  }));
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    fallback.hidden = false;
    status.hidden = false;
    status.textContent = 'The 3D view was interrupted. Reload to restore it.';
    [motionButton, perspectiveButton, ...materialButtons].forEach(button => button.disabled = true);
  });
  // PMREM render targets need rebuilding after context loss; a reload is
  // offered instead of pretending the old GPU environment is still valid.
  resize();
  fallback.hidden = true;
  status.hidden = true;
  [motionButton, perspectiveButton, ...materialButtons].forEach(button => button.disabled = false);
  syncMotion();

  // GSAP is optional polish. A blocked GSAP CDN never prevents the scene or
  // UI from working; reduced-motion users get the complete static layout.
  if (!reduceMotion.matches) {
    import('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js').then(() => {
      if (reduceMotion.matches || paused || document.hidden || contextLost || !window.gsap) return;
      entrance = window.gsap.from('.hero-copy', { opacity: 0, y: 24, duration: 1.2, ease: 'power3.out', clearProps: 'all' });
    }).catch(() => { /* Native rendering and all controls remain available. */ });
  }
} catch (error) {
  renderer?.dispose();
  document.querySelector('#webgl').hidden = true;
  fallback.hidden = false;
  status.hidden = false;
  status.textContent = 'The 3D view is unavailable. Check your connection and WebGL support, then reload.';
  // No error payload or visitor data is sent to any service.
  console.warn('Unable to initialize the 3D hero:', error instanceof Error ? error.message : 'Unknown rendering error');
}
