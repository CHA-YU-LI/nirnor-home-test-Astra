import { instance, scope, clamp } from '../../js/library/runtime.js';
import { artwork } from '../../js/library/art.js';
export function init(root, options = {}) {
  return instance(root, { duration: 1, variant: 'list', hold: -1, art: 1 }, options, (el, p) => {
    const canvas = el.querySelector('canvas'),
      ctx = canvas.getContext('2d'),
      art = artwork(p.art);
    let progress = 0;
    function draw(dt, t, reduced) {
      progress = reduced ? 1 : Math.min(1, progress + dt / Math.max(0.1, p.duration));
      const v = p.hold >= 0 ? p.hold / 100 : progress;
      const w = canvas.width,
        h = canvas.height;
      const src = Math.max(1, Math.round(art.width * v)),
        dest = Math.max(1, Math.round(w * v));
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(art, 0, 0, src, art.height, 0, 0, dest, h);
      if (dest < w)
        ctx.drawImage(art, Math.min(src, art.width - 1), 0, 1, art.height, dest, 0, w - dest, h);
      el.dataset.progress = v.toFixed(3);
    }
    const life = scope(el, draw);
    life.resize(() => {
      canvas.width = Math.round(el.clientWidth * Math.min(devicePixelRatio, 1.5));
      canvas.height = Math.round(el.clientHeight * Math.min(devicePixelRatio, 1.5));
      draw(0, 0, life.motion.matches);
    });
    const replay = () => {
      progress = 0;
      draw(0, 0, life.motion.matches);
    };
    if (p.variant === 'list') {
      life.on(el, 'pointerenter', (e) => {
        if (e.pointerType === 'mouse') replay();
      });
      life.on(el, 'click', replay);
      life.on(el, 'focusin', replay);
    }
    life.refresh();
    return { ...life, replay };
  });
}
