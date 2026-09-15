/**
 * 分類立方體分階段攤平
 * 調整下方 options，再重新整理頁面即可看到結果。
 * update() 會套用新參數；reset() 回到 effect.js 的預設值。
 */
import { init } from './effect.js';

const root = document.querySelector('[data-effect-root]');
const options = {
  "variant": "art",
  "duration": 0.5,
  "inertia": 0.1,
  "tilt": 10
};
export const effect = init(root, options);
window.effectDemo = effect;
