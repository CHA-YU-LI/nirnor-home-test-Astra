import fs from 'node:fs/promises';
import { catalog } from '../js/library/catalog.js';

const esc = value => String(value).replaceAll('|', '\\|');
for (const item of catalog) {
  const optionLines = item.options.map(option => `| ${esc(option.key)} | ${esc(option.label)} | ${esc(option.value)} | ${option.type === 'select' ? esc(option.values.join(' / ')) : `${option.min}–${option.max}`} | ${esc(option.help)} |`).join('\n');
  const defaults = Object.fromEntries(item.options.map(option => [option.key, option.value]));
  const main = `/**\n * ${item.name}\n * 調整下方 options，再重新整理頁面即可看到結果。\n * update() 會套用新參數；reset() 回到 effect.js 的預設值。\n */\nimport { init } from './effect.js';\n\nconst root = document.querySelector('[data-effect-root]');\nconst options = ${JSON.stringify(defaults, null, 2)};\nexport const effect = init(root, options);\nwindow.effectDemo = effect;\n`;
  const readme = `# ${item.name}\n\n這個資料夾把效果拆成可閱讀的 HTML、SCSS、CSS 與 JavaScript。直接開啟 index.html 可看展示；要移植到其他頁面，保留 HTML 容器、effect.css、effect.js、main.js 與「效果依賴」列出的檔案。ES Module 請透過 HTTP 伺服器載入。\n\n## 參數\n\n| key | 名稱 | 預設值 | 範圍 | 說明 |\n|---|---|---:|---|---|\n${optionLines}\n\n初始化設定寫在 main.js 的 options。執行中可呼叫 effect.update({ key: value })，也可使用 effect.replay()、effect.reset()、effect.destroy()。\n\n## 檔案\n\n- index.html：展示容器與可操作的 HTML。\n- effect.scss：樣式原始碼；修改後以 Sass 編譯成 effect.css。\n- effect.js：效果邏輯與 init(root, options) 公開介面。\n- main.js：最小初始化範例，集中放使用者要調整的參數。\n- 依賴：${item.slug === 'page-transition' ? 'page-b.html；' : ''}${item.slug === 'video-reveal' || item.slug === 'service-slider' ? 'assets/motion-study.webm；' : ''}${item.packages.join('、')}。\n\n來源與官方 API 文件請回到特效頁面的「實際使用的技術」區塊查看。\n`;
  await fs.writeFile(`demos/${item.slug}/main.js`, main);
  await fs.writeFile(`demos/${item.slug}/README.md`, readme);
}
console.log(`已為 ${catalog.length} 個效果建立 main.js 與 README.md 使用指南。`);
