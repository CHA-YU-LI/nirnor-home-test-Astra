import { init } from './demos/contact-controls/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 回饋時間：勾選底色與欄位底線過渡（ms）
  // 預設值：150；建議範圍：0–600；控制項步進：50
  duration: 150,
};

// 2. 找到 HTML 容器並啟動效果。
const root = document.querySelector('[data-effect-root]');
const effect = init(root, options);

// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。
// effect.update({ duration: 150 });
// effect.replay();  // 重播
// effect.reset();   // 回到 effect.js 的內建預設值
// effect.destroy(); // 元件移除時清理事件與動畫

window.effectDemo = effect;
