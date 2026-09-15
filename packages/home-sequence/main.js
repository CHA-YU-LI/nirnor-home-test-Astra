import { init } from './demos/home-sequence/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 循環速度：粒子與公轉方塊的速度倍率
  // 預設值：1；建議範圍：0–2；控制項步進：0.1
  speed: 1,
};

// 2. 找到 HTML 容器並啟動效果。
const root = document.querySelector('[data-effect-root]');
const effect = init(root, options);

// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。
// effect.update({ speed: 1 });
// effect.replay();  // 重播
// effect.reset();   // 回到 effect.js 的內建預設值
// effect.destroy(); // 元件移除時清理事件與動畫

window.effectDemo = effect;
