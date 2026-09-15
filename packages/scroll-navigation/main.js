import { init } from './demos/scroll-navigation/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 捲動跟隨：數值越小，慣性尾端越長
  // 預設值：0.1；建議範圍：0.03–0.25；控制項步進：0.01
  lerp: 0.1,

  // 錨點時間：點目錄時的捲動秒數
  // 預設值：1.5；建議範圍：0.3–3；控制項步進：0.1
  duration: 1.5,
};

// 2. 找到 HTML 容器並啟動效果。
const root = document.querySelector('[data-effect-root]');
const effect = init(root, options);

// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。
// effect.update({ lerp: 0.1 });
// effect.replay();  // 重播
// effect.reset();   // 回到 effect.js 的內建預設值
// effect.destroy(); // 元件移除時清理事件與動畫

window.effectDemo = effect;
