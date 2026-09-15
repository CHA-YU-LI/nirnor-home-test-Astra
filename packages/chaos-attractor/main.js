import { init } from './demos/chaos-attractor/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 粒子數：重建 geometry；手機上限 80000
  // 預設值：100000；建議範圍：20000–360000；控制項步進：20000
  count: 100000,

  // 變形時間：跨越分界後到達目標的秒數
  // 預設值：1.5；建議範圍：0.3–4；控制項步進：0.1
  duration: 1.5,

  // 自轉速度：原始緩慢旋轉的倍率
  // 預設值：1；建議範圍：0–3；控制項步進：0.1
  speed: 1,
};

// 2. 找到 HTML 容器並啟動效果。
const root = document.querySelector('[data-effect-root]');
const effect = init(root, options);

// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。
// effect.update({ count: 100000 });
// effect.replay();  // 重播
// effect.reset();   // 回到 effect.js 的內建預設值
// effect.destroy(); // 元件移除時清理事件與動畫

window.effectDemo = effect;
