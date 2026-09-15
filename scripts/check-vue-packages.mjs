import path from 'node:path';
import { build } from 'vite';
import { catalog } from '../js/library/catalog.js';

for (const item of catalog) {
  const root = path.resolve(`packages/${item.slug}-vue`);
  await build({
    root,
    configFile: path.join(root, 'vite.config.js'),
    logLevel: 'error',
    build: { write: false },
  });
  console.log(`PASS Vue production build: ${item.slug}`);
}
