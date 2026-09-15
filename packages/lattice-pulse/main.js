import { init } from './demos/lattice-pulse/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 每軸點數：总粒子數 = 此值的 3 次方
  // 預設值：20；建議範圍：8–28；控制項步進：2
  grid: 20,

  // 切換間隔：密集 / 膨脹各持續秒數
  // 預設值：8.33；建議範圍：1–12；控制項步進：0.1
  interval: 8.33,

  // 膨脹倍率：保留原站明顯的尺度跳換
  // 預設值：10；建議範圍：2–14；控制項步進：0.5
  expansion: 10,
};

// 2. 找到 HTML 容器並啟動效果。
const root = document.querySelector('[data-effect-root]');
const effect = init(root, options);

// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。
// effect.update({ grid: 20 });
// effect.replay();  // 重播
// effect.reset();   // 回到 effect.js 的內建預設值
// effect.destroy(); // 元件移除時清理事件與動畫

window.effectDemo = effect;
