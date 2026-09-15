/**
 * 點陣立方體膨脹循環
 * 調整下方 options，再重新整理頁面即可看到結果。
 * update() 會套用新參數；reset() 回到 effect.js 的預設值。
 */
import { init } from './effect.js';

const root = document.querySelector('[data-effect-root]');
const options = {
  "grid": 20,
  "interval": 8.33,
  "expansion": 10
};
export const effect = init(root, options);
window.effectDemo = effect;
