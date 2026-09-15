import { instance, scope, clamp, easeOut } from '../../js/library/runtime.js';
import { cubeNet } from '../../js/library/cube.js';
export function init(root, options = {}) {
  return instance(
    root,
    { variant: 'art', duration: 0.5, inertia: 0.1, tilt: 10 },
    options,
    (el, p) => {
      const scroller = el.querySelector('[data-scroller]'),
        anchor = el.querySelector('[data-net]');
      const { group, hinges } = cubeNet(anchor, p.variant);
      let open = false,
        progress = 0,
        rotation = 25,
        px = 0,
        py = 0,
        x = 0,
        y = 0;
      function draw(dt, t, reduced) {
        const goal = open ? 4 : 0;
        progress += clamp(goal - progress, -dt / p.duration, dt / p.duration);
        if (reduced) progress = 4;
        if (progress <= 0 && !reduced) rotation += dt * 30;
        const align = 1 - easeOut(progress);
        const damping = 1 - Math.pow(1 - p.inertia, dt * 60);
        x += (px - x) * damping;
        y += (py - y) * damping;
        group.style.transform = `rotateX(${rotation * align - (reduced ? 0 : y * p.tilt)}deg) rotateY(${rotation * align + (reduced ? 0 : x * p.tilt)}deg)`;
        hinges.forEach(({ hinge, phase }) =>
          hinge.style.setProperty('--fold', `${90 * (1 - easeOut(progress - phase))}deg`),
        );
        el.dataset.open = String(open || reduced);
        el.dataset.progress = progress.toFixed(3);
      }
      const life = scope(el, draw);
      const setOpen = (value) => {
        open = value;
        draw(0, 0, life.motion.matches);
      };
      life.on(
        el,
        'pointermove',
        (e) => {
          const r = el.getBoundingClientRect();
          px = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
          py = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        },
        { passive: true },
      );
      life.on(el, 'pointerleave', () => {
        px = py = 0;
      });
      if (scroller)
        life.on(
          scroller,
          'scroll',
          () => {
            if (
              anchor.getBoundingClientRect().top <
              scroller.getBoundingClientRect().top + scroller.clientHeight * 0.5
            )
              setOpen(true);
          },
          { passive: true },
        );
      const toggle = el.querySelector('[data-unfold]');
      if (toggle) life.on(toggle, 'click', () => setOpen(!open));
      life.resize(() => {
        const unit = Math.min(130, el.clientWidth / 5.4, el.clientHeight / 5);
        el.style.setProperty('--size', `${unit}px`);
      });
      life.refresh();
      return {
        ...life,
        setOpen,
        replay() {
          progress = 0;
          rotation = 25;
          x = y = px = py = 0;
          open = false;
          if (scroller) scroller.scrollTop = 0;
          life.resetTime();
          draw(0, 0, life.motion.matches);
        },
      };
    },
  );
}
