import { init } from './demos/orbit-cubes/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 旋轉速度：共同公轉與各自自轉速度倍率
  // 預設值：1；建議範圍：0–4；控制項步進：0.1
  speed: 1,

  // 尺寸倍率：保留 3 : 2 : 1 尺寸關係
  // 預設值：1；建議範圍：0.5–1.3；控制項步進：0.05
  scale: 1,
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
