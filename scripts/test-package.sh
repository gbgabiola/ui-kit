#!/usr/bin/env bash
set -euo pipefail

repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
mode=test
if [[ ${1:-} == --dev ]]; then
  mode=dev
  shift
fi
if [[ $# -gt 1 ]]; then
  echo "Usage: test-package.sh [--dev] [tarball]" >&2
  exit 2
fi
if [[ $# -eq 1 ]]; then
  source_archive=$(realpath -- "$1")
fi

cd "$repo"
consumer=$(mktemp -d)
trap 'rm -r -- "$consumer"' EXIT

if [[ $# -eq 0 ]]; then
  pnpm --filter @gbgabiola/ui pack --pack-destination "$consumer"
  version=$(node -p "require('./packages/ui/package.json').version")
  archive="$consumer/gbgabiola-ui-$version.tgz"
else
  archive="$source_archive"
fi

# Use the React, type, and Vite versions already locked for Storybook.
node --input-type=module - "$consumer" "$archive" <<'JS'
import { copyFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';

const [consumer, archive] = process.argv.slice(2);
const require = createRequire(resolve('apps/storybook/package.json'));
const dependencies = Object.fromEntries(
  ['react', 'react-dom', '@types/react', '@types/react-dom', 'vite'].map((name) => [
    name, require(`${name}/package.json`).version,
  ]),
);
const tarball = join(consumer, 'ui-kit.tgz');
if (archive !== tarball) copyFileSync(archive, tarball);
dependencies['@gbgabiola/ui'] = 'file:./ui-kit.tgz';

writeFileSync(join(consumer, 'package.json'), JSON.stringify({
  name: 'ui-kit-smoke-consumer',
  private: true,
  type: 'module',
  dependencies,
}));
JS

cd "$consumer"
npm install --ignore-scripts --no-audit --no-fund
cp -- "$repo"/examples/react-consumer/{index.html,app.tsx,app.css} .
if [[ "$mode" == dev ]]; then
  ./node_modules/.bin/vite --host 127.0.0.1 --port 5173 --strictPort
  exit
fi

"$repo/apps/storybook/node_modules/.bin/tsc" --noEmit --strict \
  --target ES2022 --module NodeNext --moduleResolution NodeNext \
  --jsx react-jsx --types vite/client --noUncheckedSideEffectImports app.tsx
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as ui from '@gbgabiola/ui';

for (const key of [
  'Checkbox', 'ContentCard', 'Hero', 'Navbar', 'Select', 'SiteFooter',
  'Textarea', 'TextInput', 'ThemePaletteSelect', 'ThemeToggle',
]) {
  assert.equal(typeof ui[key], 'function', `Missing runtime export: ${key}`);
}
assert(statSync(fileURLToPath(import.meta.resolve('@gbgabiola/ui/styles.css'))).size > 0);
JS
# Resolve actual package exports in the consumer build, without Storybook aliases.
./node_modules/.bin/vite build

# Exercise the production bundle before the temporary consumer is removed.
cd "$repo/apps/storybook"
UI_KIT_CONSUMER_DIR="$consumer" ./node_modules/.bin/playwright test --config playwright.consumer.config.ts
