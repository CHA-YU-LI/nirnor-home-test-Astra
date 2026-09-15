/**
 * 混沌粒子流形與形態切換
 * 調整下方 options，再重新整理頁面即可看到結果。
 * update() 會套用新參數；reset() 回到 effect.js 的預設值。
 */
import { init } from './effect.js';

const root = document.querySelector('[data-effect-root]');
const options = {
  "count": 100000,
  "duration": 1.5,
  "speed": 1
};
export const effect = init(root, options);
window.effectDemo = effect;
