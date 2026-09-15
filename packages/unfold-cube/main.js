import { init } from './demos/unfold-cube/effect.js';

// 1. 調整這裡的參數，儲存後重新整理頁面。
const options = {
  // 分類變體：各自的鉸鏈路徑與第 2、3 階段展開方向
  // 預設值："art"；可用選項：art、digital、movie、graphic、logo
  variant: 'art',

  // 階段時間：每階段秒數；先擺正再展開
  // 預設值：0.5；建議範圍：0.15–1.5；控制項步進：0.05
  duration: 0.5,

  // 跟隨慣性：每 60 Hz frame 的跟隨比例
  // 預設值：0.1；建議範圍：0.02–0.3；控制項步進：0.01
  inertia: 0.1,

  // 指標傾角：最大傾斜角度
  // 預設值：10；建議範圍：0–24；控制項步進：1
  tilt: 10,
};

// 2. 找到 HTML 容器並啟動效果。
const root = document.querySelector('[data-effect-root]');
const effect = init(root, options);

// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。
// effect.update({ variant: "art" });
// effect.replay();  // 重播
// effect.reset();   // 回到 effect.js 的內建預設值
// effect.destroy(); // 元件移除時清理事件與動畫

window.effectDemo = effect;
