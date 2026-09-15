const header = document.querySelector('[data-site-header]');
if (header) {
  const toggle = header.querySelector('.site-menu-toggle');
  const nav = header.querySelector('.site-navigation');
  const mobile = matchMedia('(max-width: 760px)');
  function close(returnFocus = false) {
    if (returnFocus && header.hasAttribute('data-open')) toggle.focus();
    header.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '展開選單');
  }
  toggle.hidden = false;
  header.setAttribute('data-ready', '');
  toggle.addEventListener('click', () => {
    if (header.hasAttribute('data-open')) return close();
    header.setAttribute('data-open', '');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '收合選單');
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
  document.addEventListener('pointerdown', event => { if (!header.contains(event.target)) close(); });
  header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) close(); });
  mobile.addEventListener('change', () => close());
  addEventListener('pagehide', () => close());
}
