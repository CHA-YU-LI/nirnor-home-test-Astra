// Two independent studies share the same small lifecycle controller. Each scene
// is created only when visible, and its RAF stops offscreen or in a hidden tab.
// No textures, additional libraries, or per-frame geometry allocations needed.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('[data-demo]').forEach(section => {
  const stage = section.querySelector('.demo-stage');
  const canvas = stage.querySelector('canvas');
  const status = section.querySelector('.demo-status');
  const pauseButton = section.querySelector('.demo-pause');
  const controls = section.querySelectorAll('button, input');
  let renderer, scene, study;
  let visible = false;
  let initialized = false;
  let failed = false;
  let paused = reducedMotion.matches;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;

  function syncPause() {
    pauseButton.textContent = paused ? 'Resume animation' : 'Pause animation';
    pauseButton.setAttribute('aria-pressed', String(paused));
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }
  function render(delta = 0) {
    if (!study || failed || !visible || document.hidden) return;
    study.update(delta, elapsed, paused || reducedMotion.matches);
    renderer.render(scene, study.camera);
  }
  function animate(now) {
    frame = 0;
    if (!visible || paused || failed || document.hidden) return;
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
    lastTime = now;
    elapsed += delta;
    render(delta);
    frame = requestAnimationFrame(animate);
  }
  function schedule() {
    if (study && visible && !paused && !failed && !document.hidden && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    }
  }
  function unavailable() {
    failed = true;
    stop();
    controls.forEach(control => control.disabled = true);
    stage.classList.remove('is-ready');
    canvas.hidden = true;
    status.hidden = false;
    status.textContent = 'This study needs WebGL and an internet connection. Reload to try again.';
  }
  function resize() {
    if (!study || failed) return;
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    study.resize(width / height, pixelRatio);
    render();
  }
  async function initialize() {
    initialized = true;
    try {
      const THREE = await import('three');
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      scene = new THREE.Scene();
      const create = section.dataset.demo === 'particles' ? createParticleField : createTerrain;
      study = create(THREE, scene, section, () => render());
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      // ResizeObserver handles layout changes; this also refreshes DPR when a
      // browser window moves between monitors with different pixel densities.
      window.addEventListener('resize', resize, { passive: true });
      controls.forEach(control => control.disabled = false);
      status.hidden = true;
      stage.classList.add('is-ready');
      schedule();
    } catch (error) {
      renderer?.dispose();
      unavailable();
      console.warn('Unable to initialize the interactive study:', error instanceof Error ? error.message : 'Unknown rendering error');
    }
  }
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    stop();
    syncPause();
    render();
    schedule();
  });
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    study?.pointerLeave?.();
    stop();
    syncPause();
    render();
    schedule();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { render(); schedule(); }
  });
  stage.addEventListener('pointermove', event => {
    if (!paused && !reducedMotion.matches && event.pointerType !== 'touch') study?.pointerMove?.(event);
  }, { passive: true });
  stage.addEventListener('pointerleave', () => study?.pointerLeave?.());
  // A tap works on touch devices without swallowing vertical page scrolling.
  let press;
  stage.addEventListener('pointerdown', event => {
    if (event.isPrimary && event.button === 0) press = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }, { passive: true });
  stage.addEventListener('pointerup', event => {
    if (press && press.id === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) < 8) study?.tap(event);
    press = null;
  }, { passive: true });
  stage.addEventListener('pointercancel', () => press = null);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); unavailable(); });
  syncPause();
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.001;
    if (visible && !initialized) initialize();
    else if (visible) { render(); schedule(); }
    else { study?.pointerLeave?.(); stop(); }
  }, { threshold: 0.001 });
  observer.observe(stage);
});

function createParticleField(THREE, scene, section, render) {
  const stage = section.querySelector('.demo-stage');
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30);
  const count = matchMedia('(max-width: 760px)').matches ? 4500 : 10000;
  const orb = new Float32Array(count * 3);
  const field = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const warm = new THREE.Color('#e6ffb8');
  const cool = new THREE.Color('#719eb7');
  const color = new THREE.Color();
  // A seeded distribution keeps the composition consistent between visits.
  let seed = 42;
  function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
  for (let i = 0; i < count; i++) {
    const index = i * 3;
    const y = 1 - 2 * (i + 0.5) / count;
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    const radius = Math.sqrt(1 - y * y);
    const shell = 1.55 + random() * 0.09;
    orb[index] = Math.cos(angle) * radius * shell;
    orb[index + 1] = y * shell;
    orb[index + 2] = Math.sin(angle) * radius * shell;
    // Three spiral arms with increasing scatter toward the outer edge.
    const distance = Math.pow(random(), 0.65) * 2.8;
    const theta = (i % 3) * Math.PI * 2 / 3 + distance * 1.7;
    const scatter = 0.12 + distance * 0.14;
    field[index] = Math.cos(theta) * distance + (random() - 0.5) * scatter;
    field[index + 1] = (random() - 0.5) * (0.18 + distance * 0.3);
    field[index + 2] = Math.sin(theta) * distance + (random() - 0.5) * scatter;
    color.copy(warm).lerp(cool, Math.min(1, distance / 3 + random() * 0.2));
    color.toArray(colors, index);
    sizes[i] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(orb, 3));
  geometry.setAttribute('aField', new THREE.BufferAttribute(field, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  const uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uPulse: { value: 0 },
    uPointer: { value: new THREE.Vector2() }, uHover: { value: 0 }, uPixelRatio: { value: 1 }
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aField;
      attribute vec3 aColor;
      attribute float aSize;
      uniform float uTime, uMorph, uPulse, uHover, uPixelRatio;
      uniform vec2 uPointer;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 p = mix(aField, position, uMorph);
        float angle = uTime * 0.075;
        p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
        p.y += sin(uTime * 0.6 + aSize * 20.0) * 0.045;
        p *= 1.0 + uPulse * (0.3 + aSize * 0.22);
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        vec2 away = view.xy - uPointer;
        float distanceToPointer = length(away);
        view.xy += away / max(distanceToPointer, 0.05) * exp(-distanceToPointer * 2.0) * uHover * 0.38;
        gl_Position = projectionMatrix * view;
        gl_PointSize = clamp((1.8 + aSize * 3.2) * uPixelRatio * 5.0 / -view.z, 1.0, 12.0);
        vColor = aColor;
        vAlpha = 0.55 + 0.35 * sin(aSize * 30.0 + uTime * 0.7);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float radius = length(gl_PointCoord - 0.5) * 2.0;
        if (radius > 1.0) discard;
        float glow = pow(1.0 - radius, 1.6);
        gl_FragColor = vec4(vColor, glow * vAlpha);
        #include <colorspace_fragment>
      }
    `
  });
  const points = new THREE.Points(geometry, material);
  // Deformation extends beyond the original sphere: do not cull using its bound.
  points.frustumCulled = false;
  points.rotation.set(0.62, 0, -0.22);
  scene.add(points);
  let targetMorph = 0;
  let hover = 0;
  const pointer = new THREE.Vector2();
  const formations = [...section.querySelectorAll('[data-formation]')];
  formations.forEach(button => button.addEventListener('click', () => {
    targetMorph = button.dataset.formation === 'orb' ? 1 : 0;
    formations.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    section.querySelector('[data-demo-caption]').textContent = targetMorph ? 'Orb / Shared gravity' : 'Nebula / Open field';
    render();
  }));
  function pulse() { uniforms.uPulse.value = 1; render(); }
  section.querySelector('[data-pulse]').addEventListener('click', pulse);
  return {
    camera,
    tap: pulse,
    pointerMove(event) {
      const rect = stage.getBoundingClientRect();
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      pointer.set(((event.clientX - rect.left) / rect.width * 2 - 1) * halfHeight * camera.aspect, (1 - (event.clientY - rect.top) / rect.height * 2) * halfHeight);
      hover = 1;
    },
    pointerLeave() { hover = 0; },
    resize(aspect, pixelRatio) {
      camera.aspect = aspect;
      camera.position.z = Math.max(7.1, 3.25 / (Math.tan(THREE.MathUtils.degToRad(21)) * aspect));
      camera.updateProjectionMatrix();
      uniforms.uPixelRatio.value = pixelRatio;
    },
    update(delta, elapsed, instant) {
      uniforms.uTime.value = elapsed;
      uniforms.uMorph.value = instant ? targetMorph : THREE.MathUtils.damp(uniforms.uMorph.value, targetMorph, 3, delta);
      uniforms.uPulse.value = THREE.MathUtils.damp(uniforms.uPulse.value, 0, 2.4, delta);
      uniforms.uHover.value = instant ? 0 : THREE.MathUtils.damp(uniforms.uHover.value, hover, 5, delta);
      uniforms.uPointer.value.lerp(pointer, 1 - Math.exp(-7 * delta));
    }
  };
}

function createTerrain(THREE, scene, section, render) {
  const stage = section.querySelector('.demo-stage');
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  const mobile = matchMedia('(max-width: 760px)').matches;
  const geometry = new THREE.PlaneGeometry(8, 6, mobile ? 64 : 100, mobile ? 48 : 76);
  geometry.rotateX(-Math.PI / 2);
  const uniforms = {
    uTime: { value: 0 }, uAmplitude: { value: 1.21 }, uRipple: { value: new THREE.Vector2() },
    uRippleAge: { value: 99 }, uWireframe: { value: 0 }
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    vertexShader: `
      uniform float uTime, uAmplitude, uRippleAge;
      uniform vec2 uRipple;
      varying float vHeight;
      varying vec3 vNormal;
      varying vec3 vView;
      float heightAt(vec2 p) {
        float waves = sin(p.x * 1.15 + uTime * 0.65) * cos(p.y * 0.95 + uTime * 0.3) * 0.38;
        waves += sin(p.x * 0.6 + p.y * 1.35 - uTime * 0.5) * 0.2;
        float distanceToTouch = length(p - uRipple);
        float ring = exp(-pow(distanceToTouch - uRippleAge * 1.65, 2.0) * 1.8);
        float ripple = sin(distanceToTouch * 6.0 - uRippleAge * 5.0) * ring * exp(-uRippleAge * 0.7) * 0.65;
        return waves * uAmplitude + ripple;
      }
      void main() {
        vec3 p = position;
        p.y = heightAt(p.xz);
        // Finite differences keep the normal consistent with the same waves,
        // including the transient ripple. All deformation stays on the GPU.
        float dx = (heightAt(p.xz + vec2(0.025, 0.0)) - p.y) / 0.025;
        float dz = (heightAt(p.xz + vec2(0.0, 0.025)) - p.y) / 0.025;
        vNormal = normalize(normalMatrix * vec3(-dx, 1.0, -dz));
        vec4 view = modelViewMatrix * vec4(p, 1.0);
        vView = -view.xyz;
        vHeight = p.y;
        gl_Position = projectionMatrix * view;
      }
    `,
    fragmentShader: `
      uniform float uWireframe;
      varying float vHeight;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 normal = normalize(vNormal);
        float light = max(dot(normal, normalize(vec3(-0.3, 0.8, 0.7))), 0.0);
        float rim = pow(1.0 - abs(dot(normal, normalize(vView))), 2.5);
        vec3 low = vec3(0.035, 0.11, 0.15);
        vec3 high = vec3(0.40, 0.63, 0.70);
        vec3 color = mix(low, high, smoothstep(-0.75, 0.95, vHeight));
        color *= 0.35 + light * 0.85;
        // Antialiased elevation contours make changes in height easy to read.
        float contour = abs(fract(vHeight * 3.5) - 0.5);
        float line = 1.0 - smoothstep(0.012, 0.012 + fwidth(vHeight * 3.5), contour);
        color += vec3(0.27, 0.49, 0.54) * line * 0.32 + rim * vec3(0.11, 0.20, 0.24);
        color = mix(color, vec3(0.25, 0.48, 0.56) * (0.6 + light * 0.5), uWireframe);
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `
  });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.frustumCulled = false;
  scene.add(terrain);
  const surfaces = [...section.querySelectorAll('[data-surface]')];
  surfaces.forEach(button => button.addEventListener('click', () => {
    material.wireframe = button.dataset.surface === 'wireframe';
    uniforms.uWireframe.value = Number(material.wireframe);
    surfaces.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    section.querySelector('[data-demo-caption]').textContent = material.wireframe ? 'Wireframe / Beneath the surface' : 'Surface / Contour study';
    render();
  }));
  section.querySelector('#wave-height').addEventListener('input', event => {
    const value = Number(event.target.value);
    uniforms.uAmplitude.value = value / 100 * 2.2;
    section.querySelector('#wave-value').value = `${value}%`;
    render();
  });
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const point = new THREE.Vector3();
  const pointer = new THREE.Vector2();
  function ripple(x = 0, z = 0) {
    uniforms.uRipple.value.set(x, z);
    // Start slightly after zero so a paused/reduced-motion user also sees the
    // result immediately. It evolves only after animation is explicitly active.
    uniforms.uRippleAge.value = 0.22;
    render();
  }
  section.querySelector('[data-ripple]').addEventListener('click', () => ripple());
  return {
    camera,
    tap(event) {
      const rect = stage.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(plane, point)) ripple(THREE.MathUtils.clamp(point.x, -4, 4), THREE.MathUtils.clamp(point.z, -3, 3));
    },
    resize(aspect) {
      camera.aspect = aspect;
      // A larger distance on portrait screens preserves the full terrain width.
      const distance = Math.max(1, 1.2 / aspect);
      camera.position.set(5.8 * distance, 5.3 * distance, 7.8 * distance);
      camera.lookAt(0, -0.1, 0);
      camera.updateProjectionMatrix();
    },
    update(delta, elapsed) {
      uniforms.uTime.value = elapsed;
      uniforms.uRippleAge.value = Math.min(99, uniforms.uRippleAge.value + delta);
    }
  };
}
