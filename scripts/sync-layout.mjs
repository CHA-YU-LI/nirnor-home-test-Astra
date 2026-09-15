import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { catalog } from '../js/library/catalog.js';

const root = new URL('../', import.meta.url);
const read = file => fs.readFile(new URL(file, root), 'utf8');
const header = await read('components/header.html');
const footer = await read('components/footer.html');
const pages = ['index.html', 'library.html', 'audit.html', 'about.html', ...catalog.map(item => `demos/${item.slug}/index.html`), 'demos/page-transition/page-b.html'];
const font = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;500&display=swap" rel="stylesheet">';
for (const file of pages) {
  let html;
  try { html = await read(file); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  const prefix = file.startsWith('demos/') ? '../../' : '';
  const current = file === 'index.html' ? 'home' : file === 'audit.html' ? 'audit' : file === 'about.html' ? 'about' : 'library';
  const render = text => text.replaceAll('{{root}}', prefix)
    .replaceAll('{{home}}', current === 'home' ? 'aria-current="page"' : '')
    .replaceAll('{{library}}', current === 'library' ? 'aria-current="page"' : '')
    .replaceAll('{{audit}}', current === 'audit' ? 'aria-current="page"' : '')
    .replaceAll('{{about}}', current === 'about' ? 'aria-current="page"' : '');
  html = html.replace(/<!-- site-header:start -->[\s\S]*?<!-- site-header:end -->\s*/g, '')
    .replace(/\s*<!-- site-footer:start -->[\s\S]*?<!-- site-footer:end -->\s*/g, '')
    .replace(/\s*<script type="module" src="(?:\.\.\/\.\.\/)?js\/site\.js"><\/script>\s*/g, '')
    .replace(/<header class="(?:header|lib-header)"[\s\S]*?<\/header>\s*/g, '')
    .replace(/<footer class="(?:footer site-footer|lib-footer)"[\s\S]*?<\/footer>\s*/g, '');
  html = html.replace(/(<body\b[^>]*>)\s*/, (_, tag) => `${tag}\n<!-- site-header:start -->\n${render(header)}<!-- site-header:end -->\n`)
    .replace(/\s*<\/body>/, `\n<!-- site-footer:start -->\n${render(footer)}<!-- site-footer:end -->\n<script type="module" src="${prefix}js/site.js"></script>\n</body>`);
  if (!html.includes('Noto+Serif+TC')) html = html.replace('</head>', `${font}</head>`);
  if (!html.includes(`${prefix}css/site.css`)) html = html.replace('</head>', `<link rel="stylesheet" href="${prefix}css/site.css"></head>`);
  await fs.writeFile(new URL(file, root), html);
}
console.log(`共用 Header / Footer 已同步至 ${pages.length} 個頁面（${fileURLToPath(root)}）。`);
