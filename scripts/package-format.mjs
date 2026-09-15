import fs from 'node:fs/promises';
import path from 'node:path';
import * as prettier from 'prettier';

// Downloaded examples use readable source formatting, including copied helpers.
// Keep these settings local to the packages rather than reformatting the site.
const options = {
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  singleQuote: true,
  semi: true,
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'css',
  proseWrap: 'always',
};
const extensions = new Set(['.html', '.vue', '.js', '.mjs', '.scss', '.css', '.md', '.json']);

export async function formatPackage(directory, { check = false } = {}) {
  let count = 0;
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      count += await formatPackage(file, { check });
      continue;
    }
    if (!entry.isFile() || !extensions.has(path.extname(file))) continue;
    let source = await fs.readFile(file, 'utf8');
    const settings = { ...options, filepath: file };
    if (check) {
      if (!(await prettier.check(source, settings))) {
        throw new Error(`Package source is not formatted: ${file}`);
      }
    } else {
      // These captions use white-space: pre-wrap and animate their text nodes.
      // Preserve authored line breaks, which HTML formatters otherwise fold.
      if (path.extname(file) === '.html') {
        source = source.replace(/<p\b[^>]*\bdata-blink\b[^>]*>[\s\S]*?<\/p>/g, (paragraph) =>
          paragraph.includes('\n') ? `<!-- prettier-ignore -->\n${paragraph}` : paragraph,
        );
      }
      await fs.writeFile(file, await prettier.format(source, settings));
    }
    count++;
  }
  return count;
}
