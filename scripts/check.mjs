import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { catalog } from '../js/library/catalog.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];
const htmlFiles = ['index.html', 'library.html', 'audit.html', 'about.html', 'demos/page-transition/page-b.html'];
const stylePairs = [
  ['scss/about.scss', 'css/about.css'],
  ['scss/site.scss', 'css/site.css'],
  ['scss/style.scss', 'css/style.css'],
  ['scss/library.scss', 'css/library.css'],
  ['scss/demo.scss', 'css/demo.css']
];

async function exists(file) {
  try { await access(file); return true; }
  catch { return false; }
}

const ids = new Set();
const slugs = new Set();
for (const item of catalog) {
  if (ids.has(item.id)) errors.push(`重複效果 ID：${item.id}`);
  if (slugs.has(item.slug)) errors.push(`重複效果路徑：${item.slug}`);
  ids.add(item.id);
  slugs.add(item.slug);
  htmlFiles.push(`demos/${item.slug}/index.html`);
  stylePairs.push([`demos/${item.slug}/effect.scss`, `demos/${item.slug}/effect.css`]);
  const module = `demos/${item.slug}/effect.js`;
  if (!(await exists(join(root, module)))) errors.push(`缺少效果模組：${module}`);
}

const validationFile = join(root, 'evidence/validation.json');
if (!(await exists(validationFile))) {
  errors.push('缺少驗證進度：evidence/validation.json');
} else {
  try {
    const report = JSON.parse(await readFile(validationFile, 'utf8'));
    const reported = new Set();
    for (const entry of report.demos || []) {
      if (!slugs.has(entry.slug)) errors.push(`驗證進度有未知效果：${entry.slug}`);
      if (reported.has(entry.slug)) errors.push(`重複驗證進度：${entry.slug}`);
      if (entry.status !== 'pending' && typeof entry.passed !== 'boolean') errors.push(`驗證狀態不明：${entry.slug}`);
      reported.add(entry.slug);
    }
    for (const slug of slugs) if (!reported.has(slug)) errors.push(`缺少驗證進度：${slug}`);
  } catch (error) {
    errors.push(`驗證進度格式錯誤：${error.message}`);
  }
}

for (const file of htmlFiles) {
  const path = join(root, file);
  if (!(await exists(path))) { errors.push(`缺少頁面：${file}`); continue; }
  const html = await readFile(path, 'utf8');
  for (const component of ['site-header', 'site-footer']) {
    if (html.split(`<!-- ${component}:start -->`).length !== 2 || html.split(`<!-- ${component}:end -->`).length !== 2) {
      errors.push(`${file} 的共用 ${component} 缺少或重複，請執行 npm run sync:layout。`);
    }
  }
  for (const [, , raw] of html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/g)) {
    if (/^(?:https?:|data:|mailto:|tel:|#|\/\/)/i.test(raw)) continue;
    const link = decodeURIComponent(raw.split(/[?#]/, 1)[0]);
    if (!link) continue;
    const target = resolve(root, dirname(file), link);
    if (!(await exists(target)) && !(await exists(join(target, 'index.html')))) {
      errors.push(`${file} 的連結找不到檔案：${raw}`);
    }
  }
}

const normalize = css => css.replace(/\r\n/g, '\n').trimEnd();
for (const [source, output] of stylePairs) {
  const inputPath = join(root, source);
  const outputPath = join(root, output);
  if (!(await exists(inputPath))) { errors.push(`缺少 SCSS：${source}`); continue; }
  if (!(await exists(outputPath))) { errors.push(`缺少編譯後 CSS：${output}`); continue; }
  try {
    const compiled = sass.compile(inputPath, { style: 'expanded', sourceMap: false }).css;
    const saved = await readFile(outputPath, 'utf8');
    if (normalize(compiled) !== normalize(saved)) errors.push(`CSS 與 SCSS 不一致：${output}`);
  } catch (error) {
    errors.push(`無法編譯 ${source}：${error.message}`);
  }
}

if (errors.length) {
  errors.forEach(error => console.error(`✗ ${error}`));
  process.exitCode = 1;
} else {
  console.log(`檢查通過：${catalog.length} 個效果模組、${htmlFiles.length} 個頁面的本機連結、${stylePairs.length} 組 SCSS / CSS。`);
  console.log('此指令只檢查檔案與編譯一致性；瀏覽器互動驗證另見 docs/VALIDATION.md。');
}
