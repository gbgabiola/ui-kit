import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const archive = process.argv[2];
assert(archive, 'Usage: node scripts/verify-package.mjs <tarball>');
const expected = JSON.parse(readFileSync('packages/ui/package.json', 'utf8'));
function readEntry(path) {
  return execFileSync('tar', ['-xOf', archive, `package/${path}`], { encoding: 'utf8' });
}
const metadata = JSON.parse(readEntry('package.json'));
assert.equal(metadata.name, expected.name, 'Archive package name mismatch');
assert.equal(metadata.version, expected.version, 'Archive version mismatch');
assert.equal(metadata.license, expected.license, 'Archive license metadata mismatch');
assert.deepEqual(metadata.exports, expected.exports, 'Archive public exports mismatch');
for (const path of ['dist/index.js', 'dist/index.d.ts', 'src/styles/styles.css']) {
  assert(readEntry(path).trim(), `Missing or empty package file: ${path}`);
}
// Older releases can be verified against their original license metadata.
if (expected.license) {
  const license = existsSync('packages/ui/LICENSE') ? 'packages/ui/LICENSE' : 'LICENSE';
  assert.equal(readEntry('LICENSE'), readFileSync(license, 'utf8'), 'Archive copyright/license notice mismatch');
}
console.log(`Verified ${metadata.name}@${metadata.version} archive metadata, license, exports, types, and styles.`);
