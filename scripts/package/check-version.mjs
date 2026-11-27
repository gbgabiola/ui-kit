import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const levels = ['patch', 'minor', 'major'];
const version = (text) => { assert.match(text, /^\d+\.\d+\.\d+$/); return text.split('.').map(Number); };
const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
export function distributionPaths(paths, beforeManifest, afterManifest) {
  const metadata = ({ devDependencies, ...published }) => published;
  const sameMetadata = JSON.stringify(metadata(beforeManifest)) === JSON.stringify(metadata(afterManifest));
  return paths.filter((path) => path !== 'packages/ui/package.json' || !sameMetadata);
}
export function versionDecision({ before, after, paths, changesets = [], addedExports = false, removedExports = false }) {
  const changed = paths.some((path) => /^packages\/ui\/(?:src\/|package\.json$|LICENSE$)/.test(path));
  if (!changed && before === after) return { required: false, message: 'No distributed UI files changed; no version bump or release is required.' };
  const previous = version(before); const current = version(after);
  let level = removedExports ? (previous[0] === 0 ? 'minor' : 'major') : addedExports ? 'minor' : 'patch';
  for (const declared of changesets) {
    assert.ok(levels.includes(declared), 'Invalid UI Changeset level');
    if (levels.indexOf(declared) > levels.indexOf(level)) level = declared;
  }
  if (before === after) {
    assert.ok(changesets.some((entry) => levels.indexOf(entry) >= levels.indexOf(level)), `Add a new ${level} (or higher) UI Changeset for this package change.`);
    return { required: true, level, message: `UI ${level} release required; Changeset is prepared. Apply it on a release branch after merging.` };
  }
  const minimum = level === 'major' ? [previous[0] + 1, 0, 0] : level === 'minor' ? [previous[0], previous[1] + 1, 0] : [previous[0], previous[1], previous[2] + 1];
  assert.ok(compare(current, minimum) >= 0, `Version ${after} must be at least ${minimum.join('.')} for the ${level} change.`);
  return { required: true, level, message: `Version ${after} covers the ${level} change. Release only after the merged main checks pass.` };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const root = resolve(import.meta.dirname, '../..');
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  let base;
  if (process.env.GITHUB_EVENT_NAME === 'pull_request' && process.env.GITHUB_EVENT_PATH) base = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8')).pull_request.base.sha;
  else { base = git('merge-base', 'origin/main', 'HEAD'); if (base === git('rev-parse', 'HEAD')) base = git('rev-parse', 'HEAD^'); }
  assert.match(base, /^[a-f0-9]{40}$/);
  const beforeManifest = JSON.parse(git('show', `${base}:packages/ui/package.json`));
  const afterManifest = JSON.parse(await readFile(resolve(root, 'packages/ui/package.json'), 'utf8'));
  const paths = distributionPaths(git('diff', '--name-only', base, 'HEAD').split('\n').filter(Boolean), beforeManifest, afterManifest);
  const before = beforeManifest.version;
  const after = afterManifest.version;
  const changesets = [];
  for (const file of paths.filter((path) => /^\.changeset\/(?!README\.md$).+\.md$/.test(path))) {
    let text;
    try { text = await readFile(resolve(root, file), 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; text = git('show', `${base}:${file}`); }
    const match = text.match(/^["']?@gbgabiola\/ui["']?\s*:\s*(patch|minor|major)\s*$/m);
    if (match) changesets.push(match[1]);
  }
  const exports = (text) => new Set([...text.matchAll(/\bexport\s*\{([^}]+)\}/g)].flatMap((match) => match[1].split(',').map((entry) => entry.trim()).filter((entry) => /^[A-Z]/.test(entry) && !entry.startsWith('type '))));
  const previous = exports(git('show', `${base}:packages/ui/src/index.ts`));
  const current = exports(await readFile(resolve(root, 'packages/ui/src/index.ts'), 'utf8'));
  console.log(versionDecision({ before, after, paths, changesets, addedExports: [...current].some((name) => !previous.has(name)), removedExports: [...previous].some((name) => !current.has(name)) }).message);
}
