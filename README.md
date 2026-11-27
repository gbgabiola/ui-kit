# UI Kit

[![README views](https://hits.sh/github.com/gbgabiola/ui-kit.svg?label=README%20views&color=006a60)](https://hits.sh/github.com/gbgabiola/ui-kit/)

Reusable React 19 and TypeScript components, with working frontend demos.

[Gallery](https://gbgabiola.github.io/ui-kit/) · [Storybook](https://main--6af71445d0632045e7443388.chromatic.com/) · [Releases](https://github.com/gbgabiola/ui-kit/releases)

## Use

Download the package archive from Releases and install it with `pnpm add ./path/to/downloaded-package.tgz`.

```tsx
import { TextInput } from '@gbgabiola/ui';
import '@gbgabiola/ui/styles.css';

<div className="uik-theme" data-theme="light" data-palette="teal">
  <TextInput label="Name" />
</div>
```

## Develop

Use Node 26.13.1 LTS and pnpm 12.23.0.

```sh
pnpm install --frozen-lockfile
pnpm demo       # Gallery at http://localhost:5173/ui-kit/
pnpm storybook  # Component documentation at http://localhost:6006
pnpm lint       # Workspace correctness and React hook checks
```

Start a feature branch, then create a component with one command:

```sh
pnpm component:add StatusBadge --category Feedback --description "A status label."
```

This creates a starter component, export, demo, Storybook story, minor Changeset, and previews. Customize the component and example; the gallery and table below update from the example metadata during development and builds. Commit the generated files with your component.

See [CONTRIBUTING.md](CONTRIBUTING.md) for checks, manual additions, merge rules, and releases.

## Demos

<!-- demos:start -->

Browse 31 demos. The gallery reflects current source; packaged versions are listed in [Releases](https://github.com/gbgabiola/ui-kit/releases).

| Demo | Technology | Category | Documentation |
| --- | --- | --- | --- |
| [Blog post card](https://gbgabiola.github.io/ui-kit/demos/blog-post-card/) | HTML/CSS | Layouts | — |
| [Business card](https://gbgabiola.github.io/ui-kit/demos/business-card/) | HTML/CSS | Layouts | — |
| [Confidential email](https://gbgabiola.github.io/ui-kit/demos/confidential-email/) | HTML/CSS | Layouts | — |
| [Dicee](https://gbgabiola.github.io/ui-kit/demos/dicee/) | HTML/CSS/JavaScript | Games | — |
| [Drum kit](https://gbgabiola.github.io/ui-kit/demos/drum-kit/) | HTML/CSS/JavaScript | Games | — |
| [Survey form](https://gbgabiola.github.io/ui-kit/demos/fcc-survey-form/) | HTML/CSS | Forms | — |
| [Feature selection](https://gbgabiola.github.io/ui-kit/demos/feature-selection/) | HTML/CSS | Forms | — |
| [Ghibli characters](https://gbgabiola.github.io/ui-kit/demos/ghibli-api/) | HTML/CSS/JavaScript | Tools | — |
| [Hover effects](https://gbgabiola.github.io/ui-kit/demos/hover-effect/) | HTML/CSS | Layouts | — |
| [Loan calculator](https://gbgabiola.github.io/ui-kit/demos/loan-calculator/) | HTML/CSS/JavaScript | Tools | — |
| [Number guesser](https://gbgabiola.github.io/ui-kit/demos/number-guesser/) | HTML/CSS/JavaScript | Games | — |
| [Pricing plans](https://gbgabiola.github.io/ui-kit/demos/pricing-plans/) | HTML/CSS | Layouts | — |
| [Pricing table](https://gbgabiola.github.io/ui-kit/demos/pricing-table/) | HTML/CSS | Layouts | — |
| [Progress bar](https://gbgabiola.github.io/ui-kit/demos/progress-bar/) | HTML/CSS/JavaScript | Tools | — |
| [Simon game](https://gbgabiola.github.io/ui-kit/demos/simon-game/) | HTML/CSS/JavaScript | Games | — |
| [Task list](https://gbgabiola.github.io/ui-kit/demos/task-list/) | HTML/CSS/JavaScript | Tools | — |
| [Toggle sidebar](https://gbgabiola.github.io/ui-kit/demos/toggle-sidebar/) | HTML/CSS/JavaScript | Layouts | — |
| [Button](https://gbgabiola.github.io/ui-kit/demos/button/) | React | Actions | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/components-actions-button--docs) |
| [TextInput](https://gbgabiola.github.io/ui-kit/demos/textinput/) | React | Forms | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/text-input--docs) |
| [Textarea](https://gbgabiola.github.io/ui-kit/demos/textarea/) | React | Forms | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/components-forms-textarea--docs) |
| [Select](https://gbgabiola.github.io/ui-kit/demos/select/) | React | Forms | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/components-forms-select--docs) |
| [Checkbox](https://gbgabiola.github.io/ui-kit/demos/checkbox/) | React | Forms | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/components-forms-checkbox--docs) |
| [ThemeToggle](https://gbgabiola.github.io/ui-kit/demos/themetoggle/) | React | Theme | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/theme-toggle--docs) |
| [ThemePaletteSelect](https://gbgabiola.github.io/ui-kit/demos/themepaletteselect/) | React | Theme | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/components-theme-palette-select--docs) |
| [Navbar](https://gbgabiola.github.io/ui-kit/demos/navbar/) | React | Navigation | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/navbar--docs) |
| [Sidebar](https://gbgabiola.github.io/ui-kit/demos/sidebar/) | React | Navigation | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/sidebar--docs) |
| [ProgressBar](https://gbgabiola.github.io/ui-kit/demos/progressbar/) | React | Feedback | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/components-feedback-progress-bar--docs) |
| [Hero](https://gbgabiola.github.io/ui-kit/demos/hero/) | React | Blocks | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/blocks-hero--docs) |
| [SiteFooter](https://gbgabiola.github.io/ui-kit/demos/sitefooter/) | React | Blocks | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/blocks-site-footer--docs) |
| [ContentCard](https://gbgabiola.github.io/ui-kit/demos/contentcard/) | React | Blocks | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/blocks-content-card--docs) |
| [PricingTable](https://gbgabiola.github.io/ui-kit/demos/pricingtable/) | React | Blocks | [Docs](https://main--6af71445d0632045e7443388.chromatic.com/?path=/docs/pricing-table--docs) |

<!-- demos:end -->

## License

[MIT](LICENSE) © 2026 gbgabiola.
