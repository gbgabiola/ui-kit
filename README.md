# UI Kit

`@gbgabiola/ui` is a React 19 and TypeScript component library. Version `0.1.0` includes `TextInput`, `ThemeToggle`, and `Navbar`.

## Local development

Use Node 24 LTS and pnpm 11.25.0.

```sh
corepack enable pnpm  # If pnpm is not already available
pnpm install --frozen-lockfile
pnpm storybook
```

Open [Storybook](http://localhost:6006). **Guides** includes the MDX setup guide, **Components** groups forms and theme controls, **Blocks** contains the navbar, and **Examples** includes the palette playground. Each public component has a generated Docs page.

Storybook resolves the UI package from source, so edits appear without rebuilding the package. Run `pnpm build` to verify or generate the distributable package.

## Test and publish Storybook

```sh
pnpm --filter ui-kit-storybook exec playwright install chromium
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build:storybook
pnpm test:visual
```

On Linux, add `--with-deps` to the Chromium install command if system libraries are missing. Run visual comparisons on Linux with DejaVu Sans installed to match CI. When a visual change is intentional, run `pnpm test:visual --update-snapshots`, inspect the PNG changes, and commit the updated baselines.

Vitest runs the stories and their interactions in Chromium. Axe accessibility violations fail the tests. Open `apps/storybook/coverage/index.html` for source coverage, or use the LCOV report in the same directory. GitHub Actions runs the checks on pull requests and pushes to `main`, and uploads the coverage and static Storybook artifacts.

I recommend [Chromatic](https://www.chromatic.com/docs/github-actions/) for hosted Storybook and visual review. Connect this repo to a Chromatic project and add its token as the `CHROMATIC_PROJECT_TOKEN` GitHub Actions secret. The next push to `main` or manual run on `main` publishes the verified static build and runs Chromatic snapshots. Review and accept intended visual changes in Chromatic. The Storybook **Visual Tests** panel can also run and review builds once connected.

## Use the library

Run `pnpm --filter @gbgabiola/ui pack` from the repo root to build a versioned tarball in the repo root. In another React 19 app, install the resulting file with `pnpm add /path/to/gbgabiola-ui-0.1.0.tgz`.

```tsx
import { useState } from 'react';
import { Navbar, TextInput, ThemePaletteSelect, ThemeToggle, type Theme, type ThemePalette } from '@gbgabiola/ui';
import '@gbgabiola/ui/styles.css';

export function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [palette, setPalette] = useState<ThemePalette>('classic');

  return (
    <div className="uik-theme" data-theme={theme} data-palette={palette}>
      <Navbar
        brand="Acme"
        links={[{ href: '/', label: 'Home', current: true }]}
        actions={<ThemeToggle theme={theme} onThemeChange={setTheme} />}
      />
      <ThemePaletteSelect palette={palette} onPaletteChange={setPalette} />
      <TextInput label="Email" type="email" name="email" autoComplete="email" />
    </div>
  );
}
```

The default theme switch shows both light and dark icons and highlights the active theme. Set `variant="icon"` for a compact round button that shows the theme it will switch to.

### Theme colors

Every palette works in light and dark mode. Pass the selected value to the theme wrapper as `data-palette`; `ThemePaletteSelect` lets users change it without changing modes. The app owns both settings and can persist them when needed.

| Palette | Colors and inspiration |
| --- | --- |
| Classic (default) | Neutral slate with a blue accent |
| Ocean | Cool blue surfaces and a marine accent |
| Teal | Neutral surfaces with the teal accent from the [Next.js portfolio](https://github.com/gbgabiola/gbgabiola.github.io/blob/feat/nextjs-v4/src/app/globals.css) |
| Forest | Green surfaces with a leafy accent |
| Plum | Cream and plum with gold in dark mode, from [FBCSI](https://github.com/gbgabiola/fbcsi/blob/main/app/globals.css) |
| Walnut | Warm ivory and brown with muted gold, from [EM Carpentry](https://github.com/gbgabiola/em-carpentry/blob/main/src/app/globals.css) |
| Ember | Espresso and cream from [Caffeinawa](https://caffeinawa.pages.dev/) with an orange accent inspired by [Omnifood](https://github.com/gbgabiola/omnifood/blob/master/resources/css/style.css) |
| Crimson | Cool charcoal and red inspired by [Uniflix](https://github.com/gbgabiola/uniflix/blob/main/style.css) |

The [original portfolio](https://github.com/gbgabiola/gbgabiola.github.io/blob/main/src/components/Layout/theme.js) uses red in light mode and teal in dark mode. Crimson and Teal cover those accents as separate choices.

The theme switch follows the palette accent by default. To give it a separate accent, set `--uik-switch-accent` on the theme wrapper or a closer ancestor. For the pill, pair it with `--uik-switch-on-accent` if the default active icon color does not contrast with your accent.

For custom palette colors, override the `--uik-surface`, `--uik-text`, `--uik-muted`, `--uik-border`, `--uik-accent`, and `--uik-danger` CSS variables on the theme wrapper. Set `--uik-radius` to adjust the control radius.

## Release a version

1. Run `pnpm changeset` for changes that affect library consumers. Commit the resulting Markdown with the change.
2. Run `pnpm version:packages` on the release branch. Changesets updates the version in `packages/ui/package.json` and its `CHANGELOG.md`.
3. Run `pnpm typecheck`, `pnpm build:storybook`, and `pnpm --filter @gbgabiola/ui pack`.
4. Commit the release changes. Tag that commit with the package version, for example `git tag -a v0.2.0 -m "Release v0.2.0"`. Push the commit and tag when a remote is configured.

During initial development, use patch bumps for compatible fixes and minor bumps for features or breaking changes. Record breaking changes and migration steps in the changelog. After `1.0.0`, use major bumps for breaking changes to documented exports, props, or theme variables. The package starts private and is available as a tarball.
