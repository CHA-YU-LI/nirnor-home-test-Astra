/**
 * 慣性捲動、黏附目錄與導覽換色
 * 調整下方 options，再重新整理頁面即可看到結果。
 * update() 會套用新參數；reset() 回到 effect.js 的預設值。
 */
import { init } from './effect.js';

const root = document.querySelector('[data-effect-root]');
const options = {
  "lerp": 0.1,
  "duration": 1.5
};
export const effect = init(root, options);
window.effectDemo = effect;
