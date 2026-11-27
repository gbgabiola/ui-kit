import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versionDecision, distributionPaths } from '../package/check-version.mjs';
const initial = { before: '0.7.1', after: '0.7.1', paths: ['packages/ui/src/components/example.tsx'] };
test('documentation and demo tooling require no package release', () => {
  assert.equal(versionDecision({ ...initial, paths: ['README.md', 'apps/demo/src/examples/sample.tsx', 'scripts/components/add-component.mjs'] }).required, false);
});
test('package edits require a new Changeset', () => {
  assert.throws(() => versionDecision(initial), /new patch/);
  assert.equal(versionDecision({ ...initial, changesets: ['patch'] }).level, 'patch');
});
test('new public components require a minor Changeset', () => {
  assert.throws(() => versionDecision({ ...initial, addedExports: true, changesets: ['patch'] }), /new minor/);
  assert.equal(versionDecision({ ...initial, addedExports: true, changesets: ['minor'] }).level, 'minor');
});
test('version bumps must cover applied Changesets', () => {
  assert.throws(() => versionDecision({ ...initial, after: '0.7.2', changesets: ['minor'] }), /at least 0.8.0/);
  assert.equal(versionDecision({ ...initial, after: '0.8.0', changesets: ['minor'] }).required, true);
});
test('removed exports use minor before 1.0 and major after 1.0', () => {
  assert.equal(versionDecision({ ...initial, removedExports: true, changesets: ['minor'] }).level, 'minor');
  assert.throws(() => versionDecision({ ...initial, before: '1.0.0', after: '1.1.0', removedExports: true, changesets: ['major'] }), /at least 2.0.0/);
  assert.equal(versionDecision({ ...initial, before: '1.0.0', after: '2.0.0', removedExports: true, changesets: ['major'] }).level, 'major');
});

test('development dependencies do not request a release; published metadata still does', () => {
  const before = { name: '@gbgabiola/ui', version: '0.7.1', peerDependencies: { react: '^19.0.0' }, devDependencies: { typescript: '~5.9.3' } };
  const after = { ...before, devDependencies: { typescript: '~6.0.3' } };
  assert.deepEqual(distributionPaths(['packages/ui/package.json'], before, after), []);
  assert.deepEqual(distributionPaths(['packages/ui/src/index.ts', 'packages/ui/package.json'], before, after), ['packages/ui/src/index.ts']);
  assert.deepEqual(distributionPaths(['packages/ui/package.json'], before, { ...after, peerDependencies: { react: '^19.3.1' } }), ['packages/ui/package.json']);
});
