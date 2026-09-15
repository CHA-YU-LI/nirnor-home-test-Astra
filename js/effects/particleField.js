/**
 * Reusable particle field effect.
 *
 * Usage:
 *   const effect = createParticleField(THREE, scene, { canvas, onChange });
 *   effect.resize(aspect, pixelRatio);
 *   effect.update(delta, elapsed, reducedMotion);
 *   effect.destroy();
 */
export function createParticleField(THREE, scene, { canvas, onChange = () => {} } = {}) {
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30);
  const count = matchMedia('(max-width: 760px)').matches ? 4500 : 10000;
  const field = new Float32Array(count * 3), orb = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3), sizes = new Float32Array(count);
  const warm = new THREE.Color('#e6ffb8'), cool = new THREE.Color('#719eb7'), color = new THREE.Color();
  let seed = 42;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < count; i++) {
    const index = i * 3, y = 1 - 2 * (i + 0.5) / count, angle = i * Math.PI * (3 - Math.sqrt(5));
    const radius = Math.sqrt(1 - y * y), shell = 1.55 + random() * 0.09;
    orb[index] = Math.cos(angle) * radius * shell; orb[index + 1] = y * shell; orb[index + 2] = Math.sin(angle) * radius * shell;
    const distance = Math.pow(random(), 0.65) * 2.8, theta = (i % 3) * Math.PI * 2 / 3 + distance * 1.7, scatter = 0.12 + distance * 0.14;
    field[index] = Math.cos(theta) * distance + (random() - 0.5) * scatter;
    field[index + 1] = (random() - 0.5) * (0.18 + distance * 0.3);
    field[index + 2] = Math.sin(theta) * distance + (random() - 0.5) * scatter;
    color.copy(warm).lerp(cool, Math.min(1, distance / 3 + random() * 0.2)).toArray(colors, index);
    sizes[i] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(orb, 3));
  geometry.setAttribute('aField', new THREE.BufferAttribute(field, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  const uniforms = { uTime: { value: 0 }, uMorph: { value: 0 }, uPulse: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uHover: { value: 0 }, uPixelRatio: { value: 1 } };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec3 aField; attribute vec3 aColor; attribute float aSize; uniform float uTime,uMorph,uPulse,uHover,uPixelRatio; uniform vec2 uPointer; varying vec3 vColor; varying float vAlpha; void main(){vec3 p=mix(aField,position,uMorph);float a=uTime*.075;p.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;p.y+=sin(uTime*.6+aSize*20.)*.045;p*=1.+uPulse*(.3+aSize*.22);vec4 v=modelViewMatrix*vec4(p,1.);vec2 away=v.xy-uPointer;float d=length(away);v.xy+=away/max(d,.05)*exp(-d*2.)*uHover*.38;gl_Position=projectionMatrix*v;gl_PointSize=clamp((1.8+aSize*3.2)*uPixelRatio*5./-v.z,1.,12.);vColor=aColor;vAlpha=.55+.35*sin(aSize*30.+uTime*.7);}`,
    fragmentShader: `varying vec3 vColor; varying float vAlpha; void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(vColor,pow(1.-r,1.6)*vAlpha);#include <colorspace_fragment>}`
  });
  const points = new THREE.Points(geometry, material); points.frustumCulled = false; points.rotation.set(.62, 0, -.22); scene.add(points);
  let targetMorph = 0, hover = 0; const pointer = new THREE.Vector2();
  function pulse() { uniforms.uPulse.value = 1; onChange(); }
  function pointerMove(event) {
    const rect = canvas.getBoundingClientRect(), half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    pointer.set(((event.clientX - rect.left) / rect.width * 2 - 1) * half * camera.aspect, (1 - (event.clientY - rect.top) / rect.height * 2) * half); hover = 1;
  }
  return {
    camera, tap: pulse, pointerMove, pointerLeave: () => { hover = 0; },
    setFormation(mode) { targetMorph = mode === 'orb' ? 1 : 0; onChange(); },
    resize(aspect, pixelRatio) { camera.aspect = aspect; camera.position.z = Math.max(7.1, 3.25 / (Math.tan(THREE.MathUtils.degToRad(21)) * aspect)); camera.updateProjectionMatrix(); uniforms.uPixelRatio.value = pixelRatio; },
    update(delta, elapsed, instant) { uniforms.uTime.value = elapsed; uniforms.uMorph.value = instant ? targetMorph : THREE.MathUtils.damp(uniforms.uMorph.value, targetMorph, 3, delta); uniforms.uPulse.value = THREE.MathUtils.damp(uniforms.uPulse.value, 0, 2.4, delta); uniforms.uHover.value = instant ? 0 : THREE.MathUtils.damp(uniforms.uHover.value, hover, 5, delta); uniforms.uPointer.value.lerp(pointer, 1 - Math.exp(-7 * delta)); },
    destroy() { scene.remove(points); geometry.dispose(); material.dispose(); }
  };
}
