import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, basename } from 'node:path';
import { syncDemos } from '../demos/sync-demos.mjs';
import { componentCatalog } from '../components/component-catalog.mjs';
import { addComponent } from '../components/add-component.mjs';

async function fixture(t) {
  const root = await mkdtemp(resolve(tmpdir(), 'ui-kit-tools-'));
  t.after(async () => {
    assert.equal(dirname(root), resolve(tmpdir()));
    assert.ok(basename(root).startsWith('ui-kit-tools-'));
    await rm(root, { recursive: true, force: true });
  });
  const files = {
    'packages/ui/src/index.ts': "export { Sample, type SampleProps } from './components/sample.js';\n",
    'packages/ui/src/components/sample.tsx': 'export function Sample() { return <div>Sample</div>; }\n',
    'apps/demo/src/examples/sample.tsx': "export const meta = { component: 'Sample', category: 'General', description: 'A sample.', order: 0 };\nexport function Example() { return <div>Sample</div>; }\n",
    'apps/storybook/stories/sample.stories.tsx': "import { Sample } from '@gbgabiola/ui';\nconst meta = { title: 'Components/General/Sample', component: Sample };\nexport default meta;\nexport const FirstStory = {};\n",
    'demos/catalog.json': JSON.stringify([{ slug: 'plain', title: 'Plain demo', category: 'Layouts', description: 'Plain.', implementation: 'html-css' }]),
    'README.md': '# Fixture\n\n<!-- demos:start -->\n<!-- demos:end -->\n\nKeep this paragraph.\n',
  };
  for (const [file, value] of Object.entries(files)) {
    await mkdir(dirname(resolve(root, file)), { recursive: true }); await writeFile(resolve(root, file), value);
  }
  await syncDemos({ root });
  return root;
}
test('catalog derives source and real story IDs; synchronization is stable', async (t) => {
  const root = await fixture(t);
  const catalog = await componentCatalog(root);
  assert.equal(catalog.length, 1);
  assert.equal(catalog[0].story, 'components-general-sample--first-story');
  assert.equal(catalog[0].source, 'packages/ui/src/components/sample.tsx');
  assert.deepEqual((await syncDemos({ root, check: true })).changed, []);
  const readme = await readFile(resolve(root, 'README.md'), 'utf8');
  assert.ok(readme.includes('/demos/sample/') && readme.includes('/demos/plain/'));
  assert.ok(readme.endsWith('Keep this paragraph.\n'));
});
test('one scaffold adds export, example, story, Changeset, catalog, and README row', async (t) => {
  const root = await fixture(t);
  const result = await addComponent({ root, name: 'StatusBadge', category: 'Feedback', description: 'A status label.' });
  assert.equal(result.slug, 'statusbadge');
  assert.ok((await readFile(resolve(root, 'packages/ui/src/index.ts'), 'utf8')).includes('export { StatusBadge, type StatusBadgeProps }'));
  assert.ok((await readFile(resolve(root, '.changeset/add-status-badge.md'), 'utf8')).includes('"@gbgabiola/ui": minor'));
  const catalog = await componentCatalog(root);
  assert.equal(catalog.length, 2);
  assert.equal(catalog[1].docs, 'component-statusbadge--docs');
  assert.equal(catalog[1].story, 'component-statusbadge--default');
  const readme = await readFile(resolve(root, 'README.md'), 'utf8');
  assert.ok(readme.includes('Browse 3 demos.') && readme.includes('/demos/statusbadge/'));
  await syncDemos({ root, check: true });
});
test('new metadata automatically updates the generated table and catalog', async (t) => {
  const root = await fixture(t);
  const path = resolve(root, 'apps/demo/src/examples/sample.tsx');
  const text = await readFile(path, 'utf8');
  await writeFile(path, text.replace("category: 'General'", "category: 'Forms'"));
  await assert.rejects(syncDemos({ root, check: true }), /Generated files are stale/);
  await syncDemos({ root });
  assert.ok((await readFile(resolve(root, 'README.md'), 'utf8')).includes('| Forms |'));
  assert.equal(JSON.parse(await readFile(resolve(root, 'demos/components.json'), 'utf8'))[0].category, 'Forms');
});
test('manual edits to generated output are rejected and repaired', async (t) => {
  const root = await fixture(t); const path = resolve(root, 'README.md');
  await writeFile(path, (await readFile(path, 'utf8')).replace('Browse 2 demos.', 'Browse 200 demos.'));
  await assert.rejects(syncDemos({ root, check: true }), /README.md/);
  await syncDemos({ root });
  assert.ok((await readFile(path, 'utf8')).includes('Browse 2 demos.'));
});
test('exported components cannot silently miss a demo', async (t) => {
  const root = await fixture(t);
  await writeFile(resolve(root, 'packages/ui/src/components/missing.tsx'), 'export function Missing() { return null; }');
  await writeFile(resolve(root, 'packages/ui/src/index.ts'), (await readFile(resolve(root, 'packages/ui/src/index.ts'), 'utf8')) + "export { Missing } from './components/missing.js';");
  await assert.rejects(componentCatalog(root), /Add a demo entry for: Missing/);
});
test('duplicate demo slugs and dynamic metadata are rejected', async (t) => {
  const root = await fixture(t); const example = resolve(root, 'apps/demo/src/examples/sample.tsx');
  await writeFile(resolve(root, 'apps/demo/src/examples/duplicate.tsx'), await readFile(example, 'utf8'));
  await assert.rejects(componentCatalog(root), /Duplicate component demo slugs/);
  await rm(resolve(root, 'apps/demo/src/examples/duplicate.tsx'));
  await writeFile(example, (await readFile(example, 'utf8')).replace("description: 'A sample.'", "description: (() => { throw new Error('must not execute'); })()"));
  await assert.rejects(componentCatalog(root), /description must be a literal/);
});
test('scaffolding rejects invalid names and never overwrites files', async (t) => {
  const root = await fixture(t); const index = await readFile(resolve(root, 'packages/ui/src/index.ts'), 'utf8');
  for (const name of ['../../Outside', 'lowercase', 'Bad-Name']) await assert.rejects(addComponent({ root, name }), /PascalCase/);
  await assert.rejects(addComponent({ root, name: 'Sample' }), /already exported/);
  await writeFile(resolve(root, 'packages/ui/src/components/taken.tsx'), 'Keep this file.');
  await assert.rejects(addComponent({ root, name: 'Taken' }), /Refusing to overwrite/);
  assert.equal(await readFile(resolve(root, 'packages/ui/src/components/taken.tsx'), 'utf8'), 'Keep this file.');
  assert.equal(await readFile(resolve(root, 'packages/ui/src/index.ts'), 'utf8'), index);
});


test('table cells escape pipes in categories', async (t) => {
  const root = await fixture(t);
  const path = resolve(root, 'apps/demo/src/examples/sample.tsx');
  await writeFile(path, (await readFile(path, 'utf8')).replace("category: 'General'", "category: 'Forms | Inputs'"));
  await syncDemos({ root });
  assert.ok((await readFile(resolve(root, 'README.md'), 'utf8')).includes('Forms ' + String.fromCharCode(92) + '| Inputs'));
});
