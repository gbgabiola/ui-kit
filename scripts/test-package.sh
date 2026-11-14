#!/usr/bin/env bash
set -euo pipefail

repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repo"
consumer=$(mktemp -d)
trap 'rm -r -- "$consumer"' EXIT

if [[ $# -eq 0 ]]; then
  pnpm --filter @gbgabiola/ui pack --pack-destination "$consumer"
  version=$(node -p "require('./packages/ui/package.json').version")
  archive="$consumer/gbgabiola-ui-$version.tgz"
else
  archive=$(realpath -- "$1")
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
cat > index.html <<'HTML'
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>UI Kit consumer</title></head>
  <body><div id="root"></div><script type="module" src="/app.tsx"></script></body>
</html>
HTML
cat > app.tsx <<'TSX'
import { createRoot } from 'react-dom/client';
import {
  Checkbox, ContentCard, Hero, Navbar, Select, SiteFooter, Textarea,
  TextInput, ThemePaletteSelect, ThemeToggle, type Theme, type ThemePalette,
} from '@gbgabiola/ui';
import '@gbgabiola/ui/styles.css';

const theme: Theme = 'dark';
const palette: ThemePalette = 'walnut';

createRoot(document.getElementById('root')!).render(
  <div className="uik-theme" data-theme={theme} data-palette={palette}>
    <Navbar brand="Studio" links={[{ href: '#contact', label: 'Contact' }]} />
    <Hero title="Studio" />
    <ContentCard title="Project" />
    <form id="contact">
      <TextInput label="Email" type="email" />
      <Textarea label="Message" />
      <Select label="Service"><option>Design</option></Select>
      <Checkbox label="Send updates" />
    </form>
    <ThemeToggle theme={theme} onThemeChange={() => {}} />
    <ThemePaletteSelect palette={palette} onPaletteChange={() => {}} />
    <SiteFooter brand="Studio" />
  </div>,
);
TSX

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
