# UI Kit

`@gbgabiola/ui` is a React 19 and TypeScript component library. Version `0.1.0` includes `TextInput`, `ThemeToggle`, and `Navbar`.

## Local development

Use Node 24 LTS and pnpm 11.25.0.

```sh
corepack enable pnpm  # If pnpm is not already available
pnpm install --frozen-lockfile
pnpm storybook
```

Open [Storybook](http://localhost:6006). Run `pnpm typecheck` to check the library and stories, and `pnpm build:storybook` to generate the static catalog. After editing the library, rerun `pnpm build` to refresh its compiled exports in the preview.

## Use the library

Run `pnpm --filter @gbgabiola/ui pack` from the repo root to build a versioned tarball in the repo root. In another React 19 app, install the resulting file with `pnpm add /path/to/gbgabiola-ui-0.1.0.tgz`.

```tsx
import { useState } from 'react';
import { Navbar, TextInput, ThemeToggle, type Theme } from '@gbgabiola/ui';
import '@gbgabiola/ui/styles.css';

export function App() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <div className="uik-theme" data-theme={theme}>
      <Navbar
        brand="Acme"
        links={[{ href: '/', label: 'Home', current: true }]}
        actions={<ThemeToggle theme={theme} onThemeChange={setTheme} />}
      />
      <TextInput label="Email" type="email" name="email" autoComplete="email" />
    </div>
  );
}
```

The app owns theme state and can persist it when needed. For custom colors, override the `--uik-surface`, `--uik-text`, `--uik-muted`, `--uik-border`, `--uik-accent`, and `--uik-danger` CSS variables on the theme wrapper. Set `--uik-radius` to adjust the control radius.

## Release a version

1. Run `pnpm changeset` for changes that affect library consumers. Commit the resulting Markdown with the change.
2. Run `pnpm version:packages` on the release branch. Changesets updates the version in `packages/ui/package.json` and its `CHANGELOG.md`.
3. Run `pnpm typecheck`, `pnpm build:storybook`, and `pnpm --filter @gbgabiola/ui pack`.
4. Commit the release changes. Tag that commit with the package version, for example `git tag -a v0.2.0 -m "Release v0.2.0"`. Push the commit and tag when a remote is configured.

During initial development, use patch bumps for compatible fixes and minor bumps for features or breaking changes. Record breaking changes and migration steps in the changelog. After `1.0.0`, use major bumps for breaking changes to documented exports, props, or theme variables. The package starts private and is available as a tarball.
