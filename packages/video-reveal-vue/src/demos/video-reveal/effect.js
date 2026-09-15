import { instance, scope } from '../../js/library/runtime.js';
import { paintPosters } from '../../js/library/art.js';
export function init(root, options = {}) {
  return instance(root, { speed: 1 }, options, (el, p) => {
    const life = scope(el),
      video = el.querySelector('video'),
      button = el.querySelector('[data-play]'),
      cover = el.querySelector('[data-cover]'),
      status = el.querySelector('[data-video-status]');
    let wasPlaying = false,
      hiddenPause = false;
    paintPosters(el);
    video.playbackRate = p.speed;
    async function play() {
      try {
        await video.play();
        if (life.signal.aborted) {
          video.pause();
          return;
        }
        cover.hidden = true;
        button.hidden = true;
        status.textContent = '影片播放中';
      } catch {
        status.textContent = '影片尚未能播放，請再次按播放。';
      }
    }
    life.on(button, 'click', play);
    life.on(video, 'pause', () => (status.textContent = '影片已暫停'));
    life.on(video, 'play', () => (status.textContent = '影片播放中'));
    life.on(video, 'ended', () => (status.textContent = '影片播放完畢，可重播。'));
    function suspend(hidden) {
      if (hidden) {
        wasPlaying = !video.paused;
        hiddenPause = true;
        video.pause();
      } else if (hiddenPause && wasPlaying) {
        hiddenPause = false;
        play();
      }
    }
    const io = new IntersectionObserver((entries) => suspend(!entries[0].isIntersecting));
    io.observe(el);
    life.on(document, 'visibilitychange', () => suspend(document.hidden));
    life.add(() => {
      io.disconnect();
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
    life.refresh();
    return {
      ...life,
      replay() {
        video.currentTime = 0;
        play();
      },
      pause(value) {
        life.pause(value);
        suspend(value);
      },
    };
  });
}
