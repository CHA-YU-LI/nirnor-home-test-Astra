import { catalog } from '../js/library/catalog.js';
import { formatPackage } from './package-format.mjs';
import * as sass from 'sass';

let count = 0;
for (const item of catalog) {
  count += await formatPackage(`packages/${item.slug}`, { check: true });
  count += await formatPackage(`packages/${item.slug}-vue`, { check: true });
  // No project load paths: the downloadable folder must supply every import.
  sass.compile(`packages/${item.slug}/demos/${item.slug}/effect.scss`);
  sass.compile(`packages/${item.slug}-vue/src/demos/${item.slug}/effect.scss`);
}
console.log(
  `PASS: ${catalog.length * 2} packages, ${count} formatted source files; all effect SCSS compiles independently.`,
);
