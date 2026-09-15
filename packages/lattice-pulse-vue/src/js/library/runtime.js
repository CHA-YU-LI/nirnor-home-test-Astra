// Small, independent lifecycle utilities. No library UI dependencies.
export const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
export const easeOut = (t) => 1 - (1 - clamp(t)) ** 3;
export function scope(root, tick = null) {
  const controller = new AbortController();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0,
    last = 0,
    elapsed = 0,
    visible = true,
    paused = false,
    dead = false;
  const cleanups = [];
  const animations = new Set();
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }
  function run(now) {
    frame = 0;
    if (dead || paused || !visible || document.hidden || motion.matches) return;
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    elapsed += delta;
    tick(delta, elapsed, false);
    frame = requestAnimationFrame(run);
  }
  function sync() {
    stop();
    const active = !dead && !paused && visible && !document.hidden;
    root.dataset.running = String(active && !motion.matches);
    animations.forEach((a) => {
      if (active && !motion.matches) a.play();
      else a.pause();
    });
    if (active && !motion.matches && tick) frame = requestAnimationFrame(run);
    else if (!dead && motion.matches && tick) tick(0, elapsed, true);
  }
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      sync();
    },
    { threshold: 0 },
  );
  observer.observe(root);
  document.addEventListener('visibilitychange', sync, { signal: controller.signal });
  motion.addEventListener('change', sync, { signal: controller.signal });
  const api = {
    root,
    signal: controller.signal,
    motion,
    on(target, event, handler, options = {}) {
      target.addEventListener(event, handler, { ...options, signal: controller.signal });
    },
    add(fn) {
      cleanups.push(fn);
      return fn;
    },
    animate(element, keyframes, options = {}) {
      const animation = element.animate(keyframes, {
        ...options,
        duration: motion.matches ? 1 : options.duration,
        delay: motion.matches ? 0 : options.delay,
      });
      animations.add(animation);
      animation.finished
        .then(() => animations.delete(animation))
        .catch(() => animations.delete(animation));
      return animation;
    },
    cancelAnimations() {
      animations.forEach((a) => a.cancel());
      animations.clear();
    },
    resize(fn) {
      const ro = new ResizeObserver(fn);
      ro.observe(root);
      cleanups.push(() => ro.disconnect());
      fn();
    },
    pause(value = true) {
      paused = value;
      sync();
    },
    refresh() {
      sync();
    },
    resetTime() {
      elapsed = 0;
      last = 0;
    },
    destroy() {
      if (dead) return;
      dead = true;
      stop();
      controller.abort();
      observer.disconnect();
      api.cancelAnimations();
      cleanups.reverse().forEach((fn) => fn());
      delete root.dataset.running;
    },
  };
  return api;
}
export function instance(root, defaults, options, create) {
  let params = { ...defaults, ...options },
    current,
    dead = false;
  const original = root.innerHTML;
  function mount() {
    current?.destroy();
    root.innerHTML = original;
    current = create(root, params);
  }
  mount();
  return {
    replay() {
      if (!dead) current.replay?.();
    },
    reset() {
      if (dead) return;
      params = { ...defaults };
      mount();
    },
    update(next) {
      if (dead) return;
      params = { ...params, ...next };
      mount();
    },
    pause(value) {
      current?.pause?.(value);
    },
    action(name, ...args) {
      return current?.[name]?.(...args);
    },
    destroy() {
      if (dead) return;
      dead = true;
      current?.destroy();
      root.innerHTML = original;
    },
    get params() {
      return { ...params };
    },
  };
}
export function reveal(
  scope,
  element,
  { duration = 300, delay = 100, spread = 500, rowDelay = 0 } = {},
) {
  const originals = [...element.childNodes].map((e) => e.cloneNode(true));
  const read = (node) =>
    node.nodeType === 3
      ? node.textContent
      : node.nodeName === 'BR'
        ? '\n'
        : [...node.childNodes].map(read).join('');
  const text = read(element);
  element.setAttribute('aria-label', text);
  const whiteSpace = element.style.whiteSpace;
  element.style.whiteSpace = 'pre-wrap';
  element.replaceChildren();
  let seed = 173;
  const spans = Array.from(text).map((char) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.setAttribute('aria-hidden', 'true');
    element.append(span);
    return span;
  });
  function replay() {
    spans.forEach((span, i) => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      span.getAnimations().forEach((a) => a.cancel());
      scope.animate(
        span,
        [
          { opacity: 0, offset: 0, easing: 'steps(1,end)' },
          { opacity: 0.5, offset: 0.1, easing: 'steps(1,end)' },
          { opacity: 0.2, offset: 0.2, easing: 'steps(1,end)' },
          { opacity: 0.7, offset: 0.3, easing: 'steps(1,end)' },
          { opacity: 0, offset: 0.4 },
          { opacity: 1, offset: 1 },
        ],
        { duration, delay: delay + (seed / 4294967296) * spread + rowDelay, fill: 'backwards' },
      );
    });
  }
  scope.add(() => {
    element.replaceChildren(...originals);
    element.removeAttribute('aria-label');
    element.style.whiteSpace = whiteSpace;
  });
  replay();
  return replay;
}
