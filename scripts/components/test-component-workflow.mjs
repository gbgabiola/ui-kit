import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { resolve, dirname, basename, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { tmpdir } from 'node:os';
import { chromium, serve } from '../shared/demo-browser.mjs';

const root = resolve(import.meta.dirname, '../..');
const fixture = await mkdtemp(resolve(tmpdir(), 'ui-kit-component-workflow-'));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
let browser; let server; let development; let added = false;
async function waitFor(check, label, timeout = 60000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { if (await check()) return; await delay(200); }
  throw new Error(`Timed out: ${label}`);
}
function pnpm(...args) {
  execFileSync('pnpm', args, { cwd: fixture, stdio: 'inherit', env: process.env });
}
async function put(file, text) {
  const target = resolve(fixture, file);
  assert.ok(target.startsWith(fixture + sep));
  await mkdir(dirname(target), { recursive: true }); await writeFile(target, text);
}
try {
  git('worktree', 'add', '--detach', fixture, 'HEAD'); added = true;
  // Include pending implementation changes during local verification.
  const paths = new Set([...git('diff', 'HEAD', '--name-only').split('\n'), ...git('ls-files', '--others', '--exclude-standard').split('\n')].filter(Boolean));
  for (const file of paths) {
    const target = resolve(fixture, file);
    assert.ok(target.startsWith(fixture + sep));
    await mkdir(dirname(target), { recursive: true }); try { await copyFile(resolve(root, file), target); } catch (error) { if (error.code !== 'ENOENT') throw error; await rm(target, { force: true }); }
  }
  pnpm('install', '--frozen-lockfile', '--offline');
  pnpm('component:add', 'ComponentWorkflowProbe', '--category', 'Feedback', '--description', 'Temporary component workflow verification.');
  const catalog = JSON.parse(await readFile(resolve(fixture, 'demos/components.json'), 'utf8'));
  const original = JSON.parse(await readFile(resolve(root, 'demos/components.json'), 'utf8'));
  assert.equal(catalog.length, original.length + 1);
  assert.ok(catalog.some((item) => item.slug === 'componentworkflowprobe'));
  assert.ok((await readFile(resolve(fixture, 'README.md'), 'utf8')).includes('/demos/componentworkflowprobe/'));
  assert.ok((await readFile(resolve(fixture, '.changeset/add-component-workflow-probe.md'), 'utf8')).includes('"@gbgabiola/ui": minor'));
  pnpm('build:storybook');
  pnpm('verify:demos');
  server = await serve(resolve(fixture, 'apps/demo/dist'));
  browser = await chromium.launch();
  const page = await browser.newPage({ colorScheme: 'dark' });
  await page.goto(`${server.url}/ui-kit/demos/componentworkflowprobe/`);
  await page.frameLocator('iframe').getByText('Component Workflow Probe preview', { exact: true }).waitFor();
  assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), 'ComponentWorkflowProbe');
  console.log('Scaffold: source, export, story, Changeset, README, previews, build, and real interactive route passed.');
  const port = new URL(server.url).port;
  await server.close(); server = undefined;
  development = spawn('pnpm', ['--filter', 'ui-kit-demo', 'exec', 'vite', '--host', '127.0.0.1', '--port', port, '--strictPort'], { cwd: fixture, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' });
  let logs = '';
  development.stdout.on('data', (data) => { logs = (logs + data.toString()).slice(-8000); });
  development.stderr.on('data', (data) => { logs = (logs + data.toString()).slice(-8000); });
  await waitFor(async () => { try { return (await fetch(`http://127.0.0.1:${port}/ui-kit/`)).ok; } catch { return false; } }, 'development server');
  await page.goto(`http://127.0.0.1:${port}/ui-kit/`);
  await page.getByRole('link', { name: 'Open ComponentWorkflowProbe', exact: false }).waitFor();
  for (const [from, to] of [
    ['packages/ui/src/components/component-workflow-probe.tsx', 'packages/ui/src/components/component-watch-probe.tsx'],
    ['apps/demo/src/examples/component-workflow-probe.tsx', 'apps/demo/src/examples/component-watch-probe.tsx'],
    ['apps/storybook/stories/component-workflow-probe.stories.tsx', 'apps/storybook/stories/component-watch-probe.stories.tsx'],
  ]) {
    await put(to, (await readFile(resolve(fixture, from), 'utf8')).replaceAll('ComponentWorkflowProbe', 'ComponentWatchProbe').replaceAll('componentworkflowprobe', 'componentwatchprobe').replaceAll('component-workflow-probe', 'component-watch-probe').replaceAll('Component Workflow Probe', 'Component Watch Probe'));
  }
  const index = resolve(fixture, 'packages/ui/src/index.ts');
  await writeFile(index, (await readFile(index, 'utf8')) + "export { ComponentWatchProbe, type ComponentWatchProbeProps } from './components/component-watch-probe.js';\n");
  await waitFor(async () => (await readFile(resolve(fixture, 'README.md'), 'utf8')).includes('/demos/componentwatchprobe/'), 'automatic README update');
  await page.getByRole('link', { name: 'Open ComponentWatchProbe', exact: false }).waitFor({ timeout: 60000 });
  await page.getByRole('link', { name: 'Open ComponentWatchProbe', exact: false }).click();
  await page.frameLocator('iframe').getByText('Component Watch Probe preview', { exact: true }).waitFor({ timeout: 60000 });
  console.log('Development: adding an export, example, and story updated the UI and README without a catalog edit or package rebuild.');
  assert.ok(!logs.includes('Error: Add a demo entry'), logs);
} finally {
  if (browser) await browser.close();
  if (server) await server.close();
  if (development && development.exitCode === null) {
    try { if (process.platform === 'win32') development.kill(); else process.kill(-development.pid, 'SIGTERM'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
    await waitFor(() => development.exitCode !== null || development.signalCode !== null, 'development server shutdown', 10000);
  }
  assert.equal(dirname(fixture), resolve(tmpdir()));
  assert.ok(basename(fixture).startsWith('ui-kit-component-workflow-'));
  if (added) git('worktree', 'remove', '--force', fixture);
}
