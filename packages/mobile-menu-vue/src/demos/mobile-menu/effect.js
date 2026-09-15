import { instance, scope, reveal } from '../../js/library/runtime.js';
export function init(root, options = {}) {
  return instance(root, { duration: 300, spread: 500 }, options, (el, p) => {
    const life = scope(el),
      dialog = el.querySelector('dialog'),
      open = el.querySelector('[data-menu-open]'),
      close = el.querySelector('[data-menu-close]');
    let previousOverflow = '';
    el.style.setProperty('--duration', `${p.duration}ms`);
    function setOpen() {
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
      open.setAttribute('aria-expanded', 'true');
      el.dataset.open = 'true';
      dialog
        .querySelectorAll('[data-menu-text]')
        .forEach((node) => reveal(life, node, { spread: p.spread }));
      close.focus();
    }
    function setClosed() {
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = previousOverflow;
      open.setAttribute('aria-expanded', 'false');
      el.dataset.open = 'false';
      life.cancelAnimations();
    }
    life.on(open, 'click', setOpen);
    life.on(close, 'click', () => {
      setClosed();
      open.focus();
    });
    life.on(dialog, 'close', setClosed);
    life.on(dialog, 'click', (event) => {
      const link = event.target.closest('[data-menu-page]');
      if (!link) return;
      event.preventDefault();
      el.querySelector('[data-menu-current]').textContent = link.dataset.menuPage;
      setClosed();
      open.focus();
    });
    life.add(() => {
      if (dialog.open) setClosed();
    });
    life.refresh();
    return {
      ...life,
      replay() {
        setClosed();
        setOpen();
      },
    };
  });
}
