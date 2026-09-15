import { init } from './demos/pixel-stretch/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 揭露時間：掃描完成所需秒數
  // 預設值：1；建議範圍：0.2–3；控制項步進：0.1
  duration: 1,

  // 觸發變體：list 會在 hover 重播；detail 只在進場播放
  // 預設值："list"；可用選項：list、detail
  variant: 'list',

  // 手動進度：-1 自動，0–100 凍結於百分比進度
  // 預設值：-1；建議範圍：-1–100；控制項步進：1
  hold: -1,
};

// 2. 找到 HTML 容器並啟動效果。
const root = document.querySelector('[data-effect-root]');
const effect = init(root, options);

// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。
// effect.update({ duration: 1 });
// effect.replay();  // 重播
// effect.reset();   // 回到 effect.js 的內建預設值
// effect.destroy(); // 元件移除時清理事件與動畫

window.effectDemo = effect;
