import { init } from './demos/blink-type/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 閃爍時間：每個字元的動畫長度（ms）
  // 預設值：300；建議範圍：100–1500；控制項步進：50
  duration: 300,

  // 隨機分散：隨機延遲上限（ms）
  // 預設值：500；建議範圍：0–1500；控制項步進：50
  spread: 500,

  // 開始延遲：第一批字元等待時間（ms）
  // 預設值：100；建議範圍：0–1000；控制項步進：50
  delay: 100,
};

// 2. 找到 HTML 容器並啟動效果。
const root = document.querySelector('[data-effect-root]');
const effect = init(root, options);

// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。
// effect.update({ duration: 300 });
// effect.replay();  // 重播
// effect.reset();   // 回到 effect.js 的內建預設值
// effect.destroy(); // 元件移除時清理事件與動畫

window.effectDemo = effect;
