import { instance, scope, reveal } from '../../js/library/runtime.js';
import { init as fieldEffect } from '../chaos-attractor/effect.js';
import { init as cubesEffect } from '../orbit-cubes/effect.js';
import { init as unfoldEffect } from '../unfold-cube/effect.js';
export function init(root, options = {}) {
  return instance(root, { speed: 1 }, options, (el, p) => {
    const life = scope(el),
      scroller = el.querySelector('[data-scroller]');
    const field = fieldEffect(el.querySelector('[data-combo-field]'), {
      speed: p.speed,
      count: 80000,
    });
    const cubes = cubesEffect(el.querySelector('[data-combo-cubes]'), {
      speed: p.speed,
      scale: 0.7,
    });
    const unfolded = unfoldEffect(el.querySelector('[data-combo-unfold]'), { variant: 'art' });
    const blink = () =>
      el.querySelectorAll('[data-blink]').forEach((node) => reveal(life, node, { spread: 500 }));
    blink();
    function update() {
      const top = scroller.getBoundingClientRect().top;
      const category = el.querySelector('[data-combo-category]');
      if (category.getBoundingClientRect().top < top + scroller.clientHeight * 0.5)
        unfolded.action('setOpen', true);
      field.action(
        'setMorph',
        el.querySelector('[data-combo-about]').getBoundingClientRect().top < top + 80 ? 1 : 0,
      );
    }
    life.on(scroller, 'scroll', update, { passive: true });
    life.resize(update);
    life.add(() => {
      field.destroy();
      cubes.destroy();
      unfolded.destroy();
    });
    life.refresh();
    return {
      ...life,
      replay() {
        scroller.scrollTop = 0;
        field.replay();
        cubes.replay();
        unfolded.replay();
        blink();
      },
      pause(value) {
        life.pause(value);
        field.pause(value);
        cubes.pause(value);
        unfolded.pause(value);
      },
    };
  });
}
