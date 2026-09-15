// Import is deliberately deferred; every effect supplies a useful Canvas fallback.
export async function threeStage(root, life) {
  const THREE = await import('three');
  if (life.signal.aborted) return null;
  const canvas = root.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 7;
  life.resize(() => {
    const r = root.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(r.height, 1);
    camera.updateProjectionMatrix();
  });
  life.add(() => {
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material) {
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          Object.values(m).forEach((v) => v?.isTexture && v.dispose());
          m.dispose();
        }
      }
    });
    renderer.dispose();
    renderer.forceContextLoss();
  });
  life.on(canvas, 'webglcontextlost', (event) => {
    event.preventDefault();
    life.pause(true);
    root.dataset.renderer = 'WebGL context lost';
    root.querySelector('[data-render-status]').textContent = 'WebGL 已中斷，請按重播重新建立。';
  });
  root.dataset.renderer = 'WebGL';
  root.querySelector('[data-render-status]').textContent = 'WebGL · Three.js 0.170.0';
  return { THREE, renderer, scene, camera };
}
