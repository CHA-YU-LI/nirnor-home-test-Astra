import { init } from './demos/service-slider/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 切換時間：媒體位移與文字收展（ms）
  // 預設值：400；建議範圍：150–1200；控制項步進：50
  duration: 400,
};

// 2. 找到 HTML 容器並啟動效果。
const root = document.querySelector('[data-effect-root]');
const effect = init(root, options);

// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。
// effect.update({ duration: 400 });
// effect.replay();  // 重播
// effect.reset();   // 回到 effect.js 的內建預設值
// effect.destroy(); // 元件移除時清理事件與動畫

window.effectDemo = effect;
