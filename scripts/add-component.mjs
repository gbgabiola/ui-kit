import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { syncDemos, workspace } from './sync-demos.mjs';

export async function addComponent({ root = workspace, name, category = 'General', description = `A reusable ${name} component.` }) {
  assert.match(name ?? '', /^[A-Z][A-Za-z0-9]*$/, 'Use a PascalCase component name, such as StatusBadge');
  assert.ok(typeof category === 'string' && category.trim(), 'Category is required');
  assert.ok(typeof description === 'string' && description.trim(), 'Description is required');
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
  const slug = name.toLowerCase();
  const label = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  const exampleText = `${label} preview`;
  const files = {
    [`packages/ui/src/components/${kebab}.tsx`]: `import type { ComponentPropsWithRef } from 'react';\n\nexport type ${name}Props = ComponentPropsWithRef<'div'>;\n\nexport function ${name}({ className, ...props }: ${name}Props) {\n  return <div {...props} className={className ? \`uik-${kebab} \${className}\` : 'uik-${kebab}'} />;\n}\n`,
    [`apps/demo/src/examples/${kebab}.tsx`]: `import { ${name} } from '@gbgabiola/ui';\nimport type { DemoMetadata } from '../demo-entry';\n\nexport const meta = ${JSON.stringify({ component: name, category, description }, null, 2)} satisfies DemoMetadata;\n\nexport function Example() {\n  return <${name}>${exampleText}</${name}>;\n}\n`,
    [`apps/storybook/stories/${kebab}.stories.tsx`]: `import { ${name} } from '@gbgabiola/ui';\nimport type { Meta, StoryObj } from '@storybook/react-vite';\nimport { expect } from 'storybook/test';\n\nconst meta = {\n  title: ${JSON.stringify(`Components/${category}/${name}`)},\n  id: ${JSON.stringify(`component-${slug}`)},\n  component: ${name},\n  args: { children: ${JSON.stringify(exampleText)} },\n  decorators: [(Story) => <div className="uik-theme" data-theme="light" data-palette="teal" style={{ padding: '1rem' }}><Story /></div>],\n} satisfies Meta<typeof ${name}>;\nexport default meta;\ntype Story = StoryObj<typeof meta>;\n\nexport const Default: Story = {\n  play: async ({ canvas }) => {\n    await expect(canvas.getByText(${JSON.stringify(exampleText)})).toBeVisible();\n  },\n};\n`,
    [`.changeset/add-${kebab}.md`]: `---\n"@gbgabiola/ui": minor\n---\n\nAdd the ${name} component.\n`,
  };
  const indexPath = resolve(root, 'packages/ui/src/index.ts');
  const index = await readFile(indexPath, 'utf8');
  assert.ok(!new RegExp(`\\b${name}\\b`).test(index), `${name} is already exported`);
  for (const file of Object.keys(files)) {
    try { await stat(resolve(root, file)); throw new Error(`Refusing to overwrite ${file}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  // Validate the current registry before writing any starter files.
  await syncDemos({ root, check: true });
  for (const [file, text] of Object.entries(files)) {
    await mkdir(resolve(root, file, '..'), { recursive: true });
    await writeFile(resolve(root, file), text, { flag: 'wx' });
  }
  await writeFile(indexPath, index.trimEnd() + `\nexport { ${name}, type ${name}Props } from './components/${kebab}.js';\n`);
  await syncDemos({ root });
  return { slug, files: Object.keys(files) };
}
function run(args) {
  const result = spawnSync('pnpm', args, { cwd: workspace, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `pnpm ${args.join(' ')} failed. Starter files are retained so you can fix the error and rerun the command.`);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const [name, ...args] = process.argv.slice(2);
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    assert.ok(['--category', '--description'].includes(args[index]) && args[index + 1], 'Usage: pnpm component:add Name [--category Group] [--description Text]');
    options[args[index].slice(2)] = args[index + 1];
  }
  const result = await addComponent({ name, ...options });
  run(['build:demo']);
  run(['previews:demos', result.slug]);
  run(['build:demo']);
  console.log(`Created ${name}, its example, story, minor Changeset, previews, gallery entry, and README row. Customize the starter files before opening a PR.`);
}
