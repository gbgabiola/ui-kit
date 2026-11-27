import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { componentCatalog } from '../components/component-catalog.mjs';
export const workspace = resolve(import.meta.dirname, '../..');
const start = '<!-- demos:start -->';
const end = '<!-- demos:end -->';
const cell = (text) => String(text).replaceAll('|', '\\|').replace(/[\r\n]+/g, ' ');
export async function syncDemos({ root = workspace, check = false } = {}) {
  const components = await componentCatalog(root);
  const standalone = JSON.parse(await readFile(resolve(root, 'demos/catalog.json'), 'utf8'));
  assert.equal(new Set([...components, ...standalone].map((item) => item.slug)).size, components.length + standalone.length, 'Demo slugs must be unique across implementations');
  const rows = [...standalone.map((item) => ({ ...item, technology: item.implementation === 'html-css' ? 'HTML/CSS' : 'HTML/CSS/JavaScript' })), ...components.map((item) => ({ ...item, technology: 'React' }))];
  const table = [
    `Browse ${rows.length} demos. The gallery reflects current source; packaged versions are listed in [Releases](https://github.com/gbgabiola/ui-kit/releases).`, '',
    '| Demo | Technology | Category | Documentation |', '| --- | --- | --- | --- |',
    ...rows.map((item) => `| [${cell(item.title)}](https://gbgabiola.github.io/ui-kit/demos/${item.slug}/) | ${item.technology} | ${cell(item.category)} | ${item.docs ? `[Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/${item.docs})` : '—'} |`),
  ].join('\n');
  const readmePath = resolve(root, 'README.md');
  const readme = await readFile(readmePath, 'utf8');
  const from = readme.indexOf(start); const to = readme.indexOf(end);
  assert.ok(from >= 0 && to > from && readme.indexOf(start, from + 1) < 0 && readme.indexOf(end, to + 1) < 0, 'README must contain one demo table marker pair');
  const outputs = [
    ['demos/components.json', JSON.stringify(components, null, 2) + '\n'],
    ['README.md', readme.slice(0, from + start.length) + '\n\n' + table + '\n\n' + readme.slice(to)],
  ];
  const changed = [];
  for (const [file, text] of outputs) {
    const path = resolve(root, file);
    let existing;
    try { existing = await readFile(path, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (existing !== text) changed.push({ path, file, text });
  }
  if (check) assert.equal(changed.length, 0, `Generated files are stale: ${changed.map((item) => item.file).join(', ')}. Run pnpm demos:sync.`);
  else for (const item of changed) await writeFile(item.path, item.text);
  return { components: components.length, demos: rows.length, changed: changed.map((item) => item.file) };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = await syncDemos({ check: process.argv.includes('--check') });
  console.log(`${process.argv.includes('--check') ? 'Checked' : 'Synchronized'} ${result.demos} demos and ${result.components} component entries${result.changed.length ? ` (${result.changed.join(', ')})` : ''}.`);
}
