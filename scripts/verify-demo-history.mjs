import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const history = JSON.parse(readFileSync(new URL('../demos/history.json', import.meta.url)));
const catalog = JSON.parse(readFileSync(new URL('../demos/catalog.json', import.meta.url)));
function git(...args) { return execFileSync('git', args, { encoding: 'utf8' }).trim(); }
for (const ref of history.refs) {
  git('merge-base', '--is-ancestor', ref.commit, 'HEAD');
}
assert.equal(git('rev-parse', `${history.importCommit}:demos/vanilla`), git('rev-parse', `${history.main}^{tree}`), 'The import must preserve the complete original tree.');
const original = git('ls-tree', '-r', '--name-only', history.main).split('\n');
const demos = original.filter((path) => /^[^/]+\/index\.html$/.test(path)).map((path) => path.split('/')[0]);
assert.deepEqual(catalog.map((demo) => demo.slug).sort(), demos.sort(), 'Every original demo must be in the gallery.');
for (const path of original.filter((path) => demos.includes(path.split('/')[0]))) {
  assert(existsSync(new URL(`../demos/vanilla/${path}`, import.meta.url)), `Missing original demo file: ${path}`);
}
assert.equal(readFileSync(new URL('../demos/vanilla/LICENSE', import.meta.url), 'utf8').trim(), git('show', `${history.main}:LICENSE`));
console.log(`Verified ${new Set(history.refs.map((ref) => ref.commit)).size} history tips, the original import tree, and all ${demos.length} demos and assets.`);

for (const demo of catalog) {
  const directory = new URL(`../demos/vanilla/${demo.slug}/`, import.meta.url);
  for (const file of readdirSync(directory).filter((name) => /\.md$/i.test(name))) {
    const text = readFileSync(new URL(file, directory), 'utf8');
    assert(!/https:\/\/(?:github\.com\/(?:genesisgabiola|gbgabiola)\/sandbox|(?:genesisgabiola|gbgabiola)\.github\.io\/sandbox)/.test(text), `Outdated Sandbox link in ${demo.slug}/${file}`);
  }
}
console.log('Imported README preview, source, and issue links target UI Kit.');
