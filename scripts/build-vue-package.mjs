import fs from 'node:fs/promises';
import path from 'node:path';
import { formatPackage } from './package-format.mjs';

export async function buildVuePackage(item, nativeFolder, markup, optionSource) {
  const name = `${item.slug}-vue`;
  const output = path.resolve('packages', name);
  if (!/^[a-z0-9-]+$/.test(name) || path.dirname(output) !== path.resolve('packages')) {
    throw new Error(`Invalid Vue package: ${name}`);
  }
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(path.join(output, 'src'), { recursive: true });
  const write = (file, source) => fs.writeFile(path.join(output, file), source);
  for (const folder of ['demos', 'js', 'scss']) {
    await fs.cp(path.join(nativeFolder, folder), path.join(output, 'src', folder), {
      recursive: true,
    });
  }
  const media = ['video-reveal', 'service-slider'].includes(item.slug);
  if (media)
    await fs.cp(path.join(nativeFolder, 'assets'), path.join(output, 'src/assets'), {
      recursive: true,
    });
  const rootManifest = JSON.parse(await fs.readFile('package.json', 'utf8'));
  const version = (key) => rootManifest.devDependencies[key];
  const dependencies = { vue: version('vue') };
  if (item.packages.some((value) => value.startsWith('Three'))) {
    dependencies.three = '0.170.0';
    const file = path.join(output, 'src/js/library/three-stage.js');
    await fs.writeFile(
      file,
      (await fs.readFile(file, 'utf8')).replace(
        'https://unpkg.com/three@0.170.0/build/three.module.js',
        'three',
      ),
    );
  }
  if (item.packages.some((value) => value.startsWith('Lenis'))) {
    dependencies.lenis = '1.3.21';
    const file = path.join(output, 'src/demos/scroll-navigation/effect.js');
    await fs.writeFile(
      file,
      (await fs.readFile(file, 'utf8')).replace(
        'https://cdn.jsdelivr.net/npm/lenis@1.3.21/dist/lenis.mjs',
        'lenis',
      ),
    );
  }
  const transition = item.slug === 'page-transition';
  if (transition) {
    // Keep both documents and navigation inside the generated Vue project.
    const second = await fs.readFile('demos/page-transition/page-b.html', 'utf8');
    const start = second.indexOf('<section class="fx-page-transition"');
    const end = second.indexOf('</section>', start) + '</section>'.length;
    if (start < 0 || end < 10) throw new Error('Missing transition page markup');
    await write('src/page-b.html', second.slice(start, end));
    const file = path.join(output, 'src/demos/page-transition/effect.js');
    let source = await fs.readFile(file, 'utf8');
    source = `import pageA from '../../effect.html?raw';\nimport pageB from '../../page-b.html?raw';\n${source}`;
    source = source.replace("new URL('./', import.meta.url)", "new URL('./', location.href)");
    const fetchBlock =
      /const response = await fetch\([\s\S]*?const html = new DOMParser\(\)\.parseFromString\(await response\.text\(\), 'text\/html'\);/;
    if (!fetchBlock.test(source))
      throw new Error('Transition adapter no longer matches effect source');
    source = source.replace(
      fetchBlock,
      "const html = new DOMParser().parseFromString(target.pathname.endsWith('page-b.html') ? pageB : pageA, 'text/html');",
    );
    await fs.writeFile(file, source);
    // The site demo's second page imports the site UI; the Vue app has its own.
    await fs.unlink(path.join(output, 'src/demos/page-transition/page-b.html'));
  }
  await write(
    'package.json',
    JSON.stringify(
      {
        name,
        version: '1.0.0',
        private: true,
        type: 'module',
        engines: { node: '^20.19.0 || >=22.12.0' },
        scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
        dependencies,
        devDependencies: {
          '@vitejs/plugin-vue': version('@vitejs/plugin-vue'),
          vite: version('vite'),
          sass: version('sass'),
        },
      },
      null,
      2,
    ),
  );
  const html =
    '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Vue 特效範例</title></head><body><div id="app"></div><script type="module" src="./src/main.js"></script></body></html>';
  await write('index.html', html);
  if (transition) await write('page-b.html', html);
  await write(
    'vite.config.js',
    `import { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\n${transition ? "import { fileURLToPath } from 'node:url';" : ''}\nexport default defineConfig({ plugins: [vue()], base: './'${transition ? ", build: { rollupOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), second: fileURLToPath(new URL('./page-b.html', import.meta.url)) } } }" : ''} });`,
  );
  await write('.gitignore', 'node_modules/\ndist/\n');
  await write(
    'src/main.js',
    "import { createApp } from 'vue';\nimport App from './App.vue';\nimport './base.scss';\ncreateApp(App).mount('#app');\n",
  );
  await write(
    'src/App.vue',
    `<script setup>\nimport EffectDemo from './EffectDemo.vue';\nconst title = ${JSON.stringify(item.name)};\nconst summary = ${JSON.stringify(item.summary)};\n</script>\n<template><main><h1>{{ title }}</h1><p>{{ summary }}</p><EffectDemo /></main></template>`,
  );
  await write(
    'src/options.js',
    `// 修改參數後儲存，Vite 會重新載入效果。\nexport const options = {\n${optionSource}\n};\n`,
  );
  await write('src/effect.html', markup);
  await write(
    'src/EffectDemo.vue',
    `<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { init } from './demos/${item.slug}/effect.js';
import { options } from './options.js';
import sourceMarkup from './effect.html?raw';
import './demos/${item.slug}/effect.scss';
${media ? "import videoUrl from './assets/motion-study.webm';" : ''}
${transition ? "import secondMarkup from './page-b.html?raw';" : ''}
// This HTML is a trusted local source file, never user-submitted content.
const markup = ${transition ? "location.pathname.endsWith('page-b.html') ? secondMarkup : sourceMarkup" : media ? "sourceMarkup.replaceAll('./assets/motion-study.webm', videoUrl)" : 'sourceMarkup'};
const host = ref(null);
const status = ref('正在啟動效果…');
let effect;
onMounted(() => {
  try {
    effect = init(host.value.querySelector('[data-effect-root]'), options);
    status.value = '可以開始操作';
  } catch (error) { status.value = '效果啟動失敗：' + error.message; }
});
// Destroy before Vue removes the DOM; this also cleans up during hot reload.
onBeforeUnmount(() => effect?.destroy());
// To update parameters at runtime: effect.update({ ${item.options[0].key}: ${JSON.stringify(item.options[0].value)} });
// update() rebuilds the effect; reset() restores its built-in defaults.
</script>
<template>
  <!-- Vue owns the host; the effect manages only the fixed local HTML inside. -->
  <div ref="host" v-html="markup"></div>
  <p class="package-status" role="status">{{ status }}</p>
</template>`,
  );
  await write(
    'src/base.scss',
    `@use './scss/tokens' as t;
* { box-sizing: border-box; }
body { margin: 0; background: t.$bg; color: t.$ink; font-family: t.$font-sans; font-size: t.$font-size-body; line-height: t.$line-height-body; }
main { width: min(1100px, calc(100% - #{t.$space-8})); margin: auto; padding-block: t.$space-8; }
h1 { font-size: t.$font-size-display-md; font-weight: t.$font-weight-regular; }
p { color: t.$muted; }
.package-status { color: t.$accent; margin-top: t.$space-4; }
`,
  );
  await write(
    'README.md',
    `# ${item.name} — Vue 範例

## 啟動

1. 完整解壓縮，用 VS Code 開啟 ${name} 資料夾（內有 package.json）。
2. 安裝 Node.js 20.19+ 或 22.12+；建議使用受支援的 LTS 版本。
3. 在這個資料夾的終端機執行：

\`\`\`sh
npm install
npm run dev
\`\`\`

開啟終端機列出的網址。Vue 單檔元件需要 Vite 編譯，請使用 npm run dev 啟動。
正式建置：npm run build；預覽建置結果：npm run preview。

## 修改位置

- src/options.js：參數用途、預設值、單位與建議範圍。
- src/effect.html：此效果的 HTML；只放入自己信任的內容。
- src/EffectDemo.vue：Vue 掛載／卸載與效果生命週期。
- src/demos/${item.slug}/effect.js：效果邏輯。
- src/demos/${item.slug}/effect.scss：效果樣式，Vite 自動编譯。
- src/scss/：完整共用 Sass 相依。
${media ? '- src/assets/motion-study.webm：可替換的展示影片。\n' : ''}

程式碼與共用依賴均保留可閱讀格式。npm install 需要網路；執行效果的套件由 npm 安裝並由 Vite 打包。
套件版本已固定；node_modules 與 dist 不包含在 ZIP，會在安裝／建置時產生。
效果會在 onMounted 啟動，並在 onBeforeUnmount 清理動畫與事件。

## 官方文件

- [Vue 快速開始](https://vuejs.org/guide/quick-start.html)
- [Vue 生命週期](https://vuejs.org/api/composition-api-lifecycle.html)
- [Vite](https://vite.dev/guide/)
`,
  );
  await formatPackage(output);
  return name;
}
