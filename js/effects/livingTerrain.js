/** Reusable GPU wave terrain. See particleField.js for the shared lifecycle. */
export function createLivingTerrain(THREE, scene, { onChange = () => {}, mobile = false } = {}) {
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 60);
  const geometry = new THREE.PlaneGeometry(8, 6, mobile ? 64 : 100, mobile ? 48 : 76); geometry.rotateX(-Math.PI / 2);
  const uniforms = { uTime: { value: 0 }, uAmplitude: { value: 1.21 }, uRipple: { value: new THREE.Vector2() }, uRippleAge: { value: 99 }, uWireframe: { value: 0 } };
  const material = new THREE.ShaderMaterial({ uniforms, side: THREE.DoubleSide, vertexShader: `uniform float uTime,uAmplitude,uRippleAge;uniform vec2 uRipple;varying float vHeight;varying vec3 vNormal;varying vec3 vView;float h(vec2 p){float w=sin(p.x*1.15+uTime*.65)*cos(p.y*.95+uTime*.3)*.38+sin(p.x*.6+p.y*1.35-uTime*.5)*.2;float d=length(p-uRipple);return w*uAmplitude+sin(d*6.-uRippleAge*5.)*exp(-pow(d-uRippleAge*1.65,2.)*1.8-uRippleAge*.7)*.65;}void main(){vec3 p=position;p.y=h(p.xz);float dx=(h(p.xz+vec2(.025,0.))-p.y)/.025;float dz=(h(p.xz+vec2(0.,.025))-p.y)/.025;vNormal=normalize(normalMatrix*vec3(-dx,1.,-dz));vec4 v=modelViewMatrix*vec4(p,1.);vView=-v.xyz;vHeight=p.y;gl_Position=projectionMatrix*v;}`, fragmentShader: `uniform float uWireframe;varying float vHeight;varying vec3 vNormal;varying vec3 vView;void main(){vec3 n=normalize(vNormal);float l=max(dot(n,normalize(vec3(-.3,.8,.7))),0.);float rim=pow(1.-abs(dot(n,normalize(vView))),2.5);vec3 color=mix(vec3(.035,.11,.15),vec3(.4,.63,.7),smoothstep(-.75,.95,vHeight))*(.35+l*.85);float contour=abs(fract(vHeight*3.5)-.5);float line=1.-smoothstep(.012,.012+fwidth(vHeight*3.5),contour);color+=vec3(.27,.49,.54)*line*.32+rim*vec3(.11,.2,.24);color=mix(color,vec3(.25,.48,.56)*(.6+l*.5),uWireframe);gl_FragColor=vec4(color,1.);#include <colorspace_fragment>}` });
  const terrain = new THREE.Mesh(geometry, material); terrain.frustumCulled = false; scene.add(terrain);
  let rippleAge = 99;
  function ripple(x = 0, z = 0) { uniforms.uRipple.value.set(x, z); rippleAge = .22; onChange(); }
  return {
    camera,
    tap: event => ripple(),
    setSurface(mode) { uniforms.uWireframe.value = Number(mode === 'wireframe'); material.wireframe = mode === 'wireframe'; onChange(); },
    setAmplitude(value) { uniforms.uAmplitude.value = value / 100 * 2.2; onChange(); },
    ripple,
    resize(aspect) { camera.aspect = aspect; const distance = Math.max(1, 1.2 / aspect); camera.position.set(5.8 * distance, 5.3 * distance, 7.8 * distance); camera.lookAt(0, -.1, 0); camera.updateProjectionMatrix(); },
    update(delta, elapsed) { uniforms.uTime.value = elapsed; rippleAge = Math.min(99, rippleAge + delta); uniforms.uRippleAge.value = rippleAge; },
    destroy() { scene.remove(terrain); geometry.dispose(); material.dispose(); }
  };
}
