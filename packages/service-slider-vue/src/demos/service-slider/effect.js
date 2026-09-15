import { instance, scope } from '../../js/library/runtime.js';
import { paintPosters } from '../../js/library/art.js';
export function init(root, options = {}) {
  return instance(root, { duration: 400 }, options, (el, p) => {
    const life = scope(el);
    const buttons = [...el.querySelectorAll('[data-service]')],
      panels = [...el.querySelectorAll('[data-panel]')],
      track = el.querySelector('[data-track]'),
      videos = [...el.querySelectorAll('video')];
    let index = 0,
      visible = true;
    paintPosters(el);
    el.style.setProperty('--duration', `${life.motion.matches ? 0 : p.duration}ms`);
    function media() {
      videos.forEach((v, i) => {
        if (i === index && visible && !document.hidden && !life.motion.matches)
          v.play().catch(() => {});
        else v.pause();
      });
    }
    function render() {
      buttons.forEach((b, i) => b.setAttribute('aria-expanded', String(i === index)));
      panels.forEach((panel, i) => {
        panel.dataset.open = String(i === index);
        panel.inert = i !== index;
      });
      track.style.transform = `translateY(-${(index * 100) / videos.length}%)`;
      const stage = el.querySelector('[data-media]');
      stage.style.marginTop = el.clientWidth > 680 ? `${index * 24}px` : '0px';
      media();
      el.dataset.active = String(index);
    }
    buttons.forEach((button, i) =>
      life.on(button, 'click', () => {
        index = i;
        render();
      }),
    );
    life.resize(render);
    const io = new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      media();
    });
    io.observe(el);
    life.add(() => {
      io.disconnect();
      videos.forEach((v) => v.pause());
    });
    life.on(document, 'visibilitychange', media);
    life.on(life.motion, 'change', () => {
      el.style.setProperty('--duration', `${life.motion.matches ? 0 : p.duration}ms`);
      render();
    });
    life.refresh();
    return {
      ...life,
      replay() {
        index = 0;
        videos.forEach((v) => (v.currentTime = 0));
        render();
      },
      pause(value) {
        life.pause(value);
        visible = !value;
        media();
      },
    };
  });
}
