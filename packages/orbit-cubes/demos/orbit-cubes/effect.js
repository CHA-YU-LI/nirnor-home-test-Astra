import { instance, scope } from '../../js/library/runtime.js';
import { solidCube } from '../../js/library/cube.js';
export function init(root, options = {}) {
  return instance(root, { speed: 1, scale: 1 }, options, (el, p) => {
    const orbit = el.querySelector('[data-orbit]');
    const cubes = [0, 1, 2].map((i) => {
      const anchor = document.createElement('div');
      anchor.className = `fx-orbit-anchor fx-orbit-anchor--${i}`;
      orbit.append(anchor);
      return solidCube(anchor, i);
    });
    const life = scope(el, (dt, t, reduced) => {
      const a = reduced ? 0 : t * p.speed;
      orbit.style.transform = `rotateY(${a * 6}deg)`;
      cubes.forEach(
        (cube, i) =>
          (cube.style.transform = `rotateX(${25 + i * 20 + a * 6}deg) rotateY(${35 + i * 70 + a * 6}deg) rotateZ(${i * 14 + a * 6}deg)`),
      );
    });
    el.style.setProperty('--cube-scale', p.scale);
    life.refresh();
    return {
      ...life,
      replay() {
        life.resetTime();
      },
    };
  });
}
