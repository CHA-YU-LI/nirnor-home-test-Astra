import { instance, scope, reveal } from '../../js/library/runtime.js';
export function init(root, options = {}) {
  return instance(root, { duration: 300, spread: 500, delay: 100 }, options, (el, p) => {
    const life = scope(el);
    const replays = [];
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            replays.push(
              reveal(life, entry.target, {
                ...p,
                rowDelay: Number(entry.target.dataset.row || 0) * 300,
              }),
            );
            observer.unobserve(entry.target);
          }
        }),
      { root: el.querySelector('[data-scroller]'), threshold: 0.05 },
    );
    el.querySelectorAll('[data-blink]').forEach((e) => observer.observe(e));
    life.add(() => observer.disconnect());
    life.refresh();
    return {
      ...life,
      replay() {
        life.cancelAnimations();
        replays.forEach((fn) => fn());
        el.querySelector('[data-scroller]').scrollTop = 0;
      },
    };
  });
}
