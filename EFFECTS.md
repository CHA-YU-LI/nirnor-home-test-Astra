# NIRNOR Effects Library

這個資料夾將視覺效果與展示頁分開。其他專案只需要載入 `three`，再從 `js/effects/index.js` 匯入效果工廠。

```js
import * as THREE from 'three';
import { createParticleField } from './js/effects/index.js';

const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const effect = createParticleField(THREE, scene, {
  canvas,
  onChange: () => renderer.render(scene, effect.camera)
});

effect.resize(width / height, Math.min(devicePixelRatio, 2));
effect.update(delta, elapsed, false);
effect.setFormation('orb');
effect.tap();
effect.destroy();
```

目前提供：

- `createParticleField`：粒子星雲／Orb 聚合、滑鼠擾動與 pulse。
- `createLivingTerrain`：GPU 波浪地形、Surface／Wireframe、波高與 ripple。

兩個效果都使用一致的生命週期：`resize`、`update`、`destroy`，展示頁的 `js/demos.js` 另外處理懶載入、IntersectionObserver、暫停與 WebGL fallback。
