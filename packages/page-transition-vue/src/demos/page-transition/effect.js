import pageA from '../../effect.html?raw';
import pageB from '../../page-b.html?raw';
import { instance, scope } from '../../js/library/runtime.js';
export function init(root, options = {}) {
  return instance(root, { duration: 100 }, options, (el, p) => {
    const life = scope(el);
    let serial = 0,
      transition = null;
    const positions = new Map();
    const view = el.querySelector('[data-page-view]');
    const base = new URL('./', location.href);
    const pages = [new URL('index.html', base).href, new URL('page-b.html', base).href];
    const oldDuration = document.documentElement.style.getPropertyValue('--route-duration');
    document.documentElement.style.setProperty('--route-duration', `${p.duration}ms`);
    const start = location.href;
    history.replaceState({ ...history.state, demoRoute: true }, '', location.href);
    async function navigate(url, push = true) {
      const target = new URL(url, location.href);
      if (!pages.includes(target.href)) return;
      const version = ++serial;
      positions.set(location.pathname, window.scrollY);
      transition?.skipTransition();
      try {
        const html = new DOMParser().parseFromString(
          target.pathname.endsWith('page-b.html') ? pageB : pageA,
          'text/html',
        );
        if (version !== serial || life.signal.aborted) return;
        const next = html.querySelector('[data-page-view]');
        if (!next) throw new Error('展示頁缺少內容');
        const update = () => {
          view.replaceChildren(...[...next.childNodes].map((n) => n.cloneNode(true)));
          if (push) history.pushState({ demoRoute: true }, '', target);
          el.dataset.page = target.pathname.endsWith('page-b.html') ? 'b' : 'a';
          document.title = html.title;
          if (!push) window.scrollTo(0, positions.get(target.pathname) || 0);
        };
        if (document.startViewTransition && !life.motion.matches) {
          transition = document.startViewTransition(update);
          await transition.finished.catch(() => {});
          transition = null;
        } else update();
        el.querySelector('[data-route-status]').textContent =
          `目前頁面：${target.pathname.split('/').pop()}`;
      } catch (error) {
        if (error.name !== 'AbortError')
          el.querySelector('[data-route-status]').textContent = error.message;
      }
    }
    life.on(el, 'click', (e) => {
      const link = e.target.closest('[data-route]');
      if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(link.href);
    });
    life.on(window, 'popstate', () => {
      if (pages.includes(location.href)) navigate(location.href, false);
    });
    life.add(() => {
      serial++;
      transition?.skipTransition();
      document.documentElement.style.setProperty('--route-duration', oldDuration);
    });
    life.refresh();
    return {
      ...life,
      replay() {
        navigate(location.href.endsWith('page-b.html') ? pages[0] : pages[1]);
      },
    };
  });
}
