import fs from 'node:fs/promises';
import path from 'node:path';
import { catalog } from '../js/library/catalog.js';
import { formatPackage } from './package-format.mjs';
import { buildVuePackage } from './build-vue-package.mjs';

const dependencyMap = {
  'blink-type': ['runtime.js'],
  'chaos-attractor': ['runtime.js', 'three-stage.js'],
  'orbit-cubes': ['runtime.js', 'cube.js', 'art.js'],
  'unfold-cube': ['runtime.js', 'cube.js', 'art.js'],
  'lattice-pulse': ['runtime.js', 'three-stage.js'],
  'pixel-stretch': ['runtime.js', 'art.js'],
  'service-slider': ['runtime.js', 'art.js'],
  'topics-accordion': ['runtime.js'],
  'mobile-menu': ['runtime.js'],
  'link-feedback': ['runtime.js'],
  'page-transition': ['runtime.js'],
  'scroll-navigation': ['runtime.js'],
  'video-reveal': ['runtime.js', 'art.js'],
  'contact-controls': ['runtime.js'],
  'works-gallery': ['runtime.js', 'art.js', 'demos/pixel-stretch/'],
  'home-sequence': [
    'runtime.js',
    'three-stage.js',
    'cube.js',
    'art.js',
    'demos/chaos-attractor/',
    'demos/orbit-cubes/',
    'demos/unfold-cube/',
  ],
};
const copy = (from, to) =>
  fs.mkdir(path.dirname(to), { recursive: true }).then(() => fs.copyFile(from, to));

// Preserve the source tree so Sass @use paths also work outside this repository.
async function copySassTree(file, destination, visited = new Set()) {
  const workspace = process.cwd();
  const absolute = path.resolve(file);
  const relative = path.relative(workspace, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Sass dependency escapes workspace: ${file}`);
  }
  if (visited.has(absolute)) return;
  visited.add(absolute);
  await copy(absolute, path.join(destination, relative));
  const source = await fs.readFile(absolute, 'utf8');
  for (const [, specifier] of source.matchAll(/@(?:use|forward)\s+['"]([^'"]+)['"]/g)) {
    if (specifier.startsWith('sass:')) continue;
    const target = path.resolve(path.dirname(absolute), specifier);
    const extension = path.extname(target) ? '' : '.scss';
    const candidates = [
      target + extension,
      path.join(path.dirname(target), '_' + path.basename(target) + extension),
    ];
    let dependency;
    for (const candidate of candidates) {
      try {
        if ((await fs.stat(candidate)).isFile()) {
          dependency = candidate;
          break;
        }
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    if (!dependency) throw new Error(`Missing Sass dependency: ${file} -> ${specifier}`);
    await copySassTree(dependency, destination, visited);
  }
}
for (const item of catalog) {
  const out = `packages/${item.slug}`;
  // Only regenerate the named package directory inside this workspace.
  const packageRoot = path.resolve('packages'),
    target = path.resolve(out);
  if (!/^[a-z0-9-]+$/.test(item.slug) || path.dirname(target) !== packageRoot)
    throw new Error(`Invalid package path: ${item.slug}`);
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(`${out}/demos/${item.slug}`, { recursive: true });
  const source = await fs.readFile(`demos/${item.slug}/index.html`, 'utf8');
  const start = source.indexOf(`<section class="fx-${item.slug}"`);
  if (start < 0) throw new Error(`Cannot extract ${item.slug} container`);
  let depth = 0,
    end = -1;
  const token = /<\/?section\b[^>]*>/g;
  token.lastIndex = start;
  for (let match; (match = token.exec(source)); ) {
    if (match[0].startsWith('</')) {
      depth--;
      if (depth === 0) {
        end = token.lastIndex;
        break;
      }
    } else depth++;
  }
  if (end < 0) throw new Error(`Cannot close ${item.slug} container`);
  const container = source
    .slice(start, end)
    .replaceAll('../../assets/', './assets/')
    .replaceAll('../../', './');
  const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${item.name}</title><link rel="stylesheet" href="./base.css"><link rel="stylesheet" href="./demos/${item.slug}/effect.css"></head><body><main><h1>${item.name}</h1><p>${item.summary}</p>${container}<p class="package-status" role="status">可操作範例</p></main><script type="module" src="./main.js"></script></body></html>`;
  const optionSource = item.options
    .map((option) => {
      const range =
        option.type === 'select'
          ? `可用選項：${option.values.join('、')}`
          : `建議範圍：${option.min}–${option.max}；控制項步進：${option.step}`;
      return `  // ${option.label}：${option.help}\n  // 預設值：${JSON.stringify(option.value)}；${range}\n  ${option.key}: ${JSON.stringify(option.value)},`;
    })
    .join('\n\n');
  await fs.writeFile(`${out}/index.html`, html);
  await fs.writeFile(
    `${out}/main.js`,
    `import { init } from './demos/${item.slug}/effect.js';\n\n// 1. 調整這裡的參數，儲存後重新整理頁面。\nconst options = {\n${optionSource}\n};\n\n// 2. 找到 HTML 容器並啟動效果。\nconst root = document.querySelector('[data-effect-root]');\nconst effect = init(root, options);\n\n// 3. 執行中也可以調整；update() 會重建效果並重設目前播放狀態。\n// effect.update({ ${item.options[0].key}: ${JSON.stringify(item.options[0].value)} });\n// effect.replay();  // 重播\n// effect.reset();   // 回到 effect.js 的內建預設值\n// effect.destroy(); // 元件移除時清理事件與動畫\n\nwindow.effectDemo = effect;\n`,
  );
  await fs.writeFile(
    `${out}/base.css`,
    '*{box-sizing:border-box}body{margin:0;background:#0a0a0a;color:#f0efe9;font:16px/1.6 Arial,"Microsoft JhengHei",sans-serif}main{width:min(1100px,calc(100% - 32px));margin:0 auto;padding:32px 0}h1{font-size:clamp(28px,5vw,56px);font-weight:400}p{color:#a1a79a}.package-status{margin-top:16px;color:#dcf99a}',
  );
  await copy(`demos/${item.slug}/effect.js`, `${out}/demos/${item.slug}/effect.js`);
  await copy(`demos/${item.slug}/effect.css`, `${out}/demos/${item.slug}/effect.css`);
  await copySassTree(`demos/${item.slug}/effect.scss`, out);
  for (const dep of dependencyMap[item.slug]) {
    if (dep.endsWith('/')) {
      const slug = dep.split('/')[1];
      await copy(`demos/${slug}/effect.js`, `${out}/demos/${slug}/effect.js`);
      continue;
    }
    await copy(`js/library/${dep}`, `${out}/js/library/${dep}`);
  }
  if (item.slug === 'video-reveal' || item.slug === 'service-slider')
    await copy('assets/motion-study.webm', `${out}/assets/motion-study.webm`);
  if (item.slug === 'page-transition')
    await copy('demos/page-transition/page-b.html', `${out}/demos/page-transition/page-b.html`);
  await fs.writeFile(
    `${out}/README.md`,
    `# ${item.name}\n\n這是一份可直接複製的完整範例。以 HTTP 伺服器開啟 index.html；不要直接雙擊檔案，因為 ES Module 需要 HTTP。\n\n## 調整參數\n\n請編輯 main.js 的 options，然後重新整理。執行中的 effect 也提供 update、replay、reset、destroy。參數細節請參考原特效頁的參數表。\n\n本包已包含本效果的 HTML、SCSS、CSS、JavaScript 與本地共用模組；${item.packages.some((p) => p.startsWith('Three')) ? 'Three.js 會依官方建議從固定 CDN 載入，因此需要網路。' : ''}${item.packages.some((p) => p.startsWith('Lenis')) ? 'Lenis 會從固定 CDN 載入，因此需要網路。' : ''}`,
  );
  // Format every source file before archiving, including nested JS and SCSS.
  await formatPackage(out);
  const vueName = await buildVuePackage(item, out, container, optionSource);
  await fs.rm(`${out}.zip`, { force: true });
  const { spawn } = await import('node:child_process');
  // A "./" archive root appears empty in Windows Explorer, even though
  // tar and Expand-Archive can read it. Use the effect's folder name instead.
  await new Promise((resolve, reject) => {
    const child = spawn('tar.exe', ['-a', '-c', '-f', `${out}.zip`, '-C', 'packages', item.slug], {
      windowsHide: true,
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`tar exited ${code}`))));
  });
  await new Promise((resolve, reject) => {
    const child = spawn(
      'tar.exe',
      ['-a', '-c', '-f', `packages/${vueName}.zip`, '-C', 'packages', vueName],
      { windowsHide: true },
    );
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`Vue archive failed: ${code}`)),
    );
  });
}
console.log(
  `已建立 ${catalog.length} 個原生 HTML 與 ${catalog.length} 個 Vue 範例包及 ZIP 下載檔。`,
);
