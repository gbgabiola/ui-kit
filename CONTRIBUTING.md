# Contributing

Use Node 26.13.1 LTS and pnpm 12.23.0. Start from an updated `main` on a short-lived `feat/` or `fix/` branch.

TypeScript stays on 6.0.3 because catalog discovery and Storybook documentation use its compiler API; TypeScript 7 removes that API. Reassess this constraint when upgrading those integrations.

## Workspace layout

- `packages/ui`: published components, blocks, and styles.
- `apps/demo`: gallery pages, shared layout, component examples, themes, and gallery browser tests.
- `apps/storybook`: component documentation, interaction tests, and Storybook snapshots.
- `demos/vanilla`, `demos/shared`, and `demos/previews`: standalone examples, their shared runtime, and generated thumbnails.
- `examples/react-consumer`: packed-package integration example and browser tests.
- `scripts/components`, `scripts/demos`, `scripts/package`, and `scripts/shared`: tooling grouped by responsibility. Root package commands remain the supported entry points.

## Add a component

Install the browser once, then create a starter:

```sh
pnpm --filter ui-kit-storybook exec playwright install chromium
pnpm component:add StatusBadge --category Feedback --description "A status label."
```

The command creates the component and public export, a local example, a Storybook story, a minor Changeset, and light/dark preview images. It synchronizes the gallery catalog and README table and rebuilds the site. Customize the starter component, example, styles, and story interactions before opening a PR. Run `pnpm previews:demos statusbadge` and rebuild after changing its appearance.

Each file in `apps/demo/src/examples/` exports literal `meta` data and an `Example` function. Put the component name, category, and description in `meta`; optional `order` and `wide` control placement and canvas width. The runtime discovers these files automatically. The synchronizer derives source paths from `packages/ui/src/index.ts` and documentation links from the component's Storybook metadata. Do not edit `demos/components.json` or the generated README table by hand.

For a manual addition, create those same source, export, example, and story files, add an appropriate Changeset, then run:

```sh
pnpm demos:sync
pnpm build:demo
pnpm previews:demos statusbadge
pnpm build:demo
```

`pnpm demo` reads components from source and watches export, example, catalog, and story metadata changes and updates the catalog and README. Builds also synchronize them. CI checks generated files before building and fails if they were not committed. `pnpm demos:check` performs this check locally.

## Validate changes

```sh
pnpm test:tooling
pnpm test:component-workflow
pnpm demos:check
pnpm check:version
pnpm test:package
pnpm typecheck
pnpm test:coverage
pnpm build:storybook
pnpm test:visual
pnpm build:demo
pnpm verify:demos
pnpm test:demo
```

Use `playwright install --with-deps chromium` on Linux if browser libraries are missing. Run visual comparisons on Linux with DejaVu Sans to match CI. For intended changes, update only the affected baselines, review the PNGs, and commit them. Gallery snapshots use `pnpm --filter ui-kit-demo exec playwright test --update-snapshots`.

Storybook tests include browser interactions and axe accessibility checks. Coverage is written to `apps/storybook/coverage/`. Package checks install the packed archive in a standalone React consumer. `pnpm example:react` opens that consumer locally; an archive path can be supplied to test a downloaded release.

CI runs **Test and build Storybook** on PRs and `main`. After main verification, Chromatic publishes Storybook and GitHub Pages deploys the same gallery build. Review any intended Chromatic changes before proceeding. A fresh main workflow run avoids duplicate Pages artifacts when recovering a deployment. Keep `CHROMATIC_PROJECT_TOKEN` in GitHub Actions secrets or your local environment; `pnpm publish:storybook` publishes a local build.

## Merge and version policy

Always use **Create a merge commit**. Do not squash or rebase merged work. Include a PR title, description, completed checks, and version decision. Wait for the required check to pass before merging, and verify the main workflow and deployment afterward.

Review versioning for every change. `pnpm check:version` checks the committed change against its base. Documentation, gallery, and development-tool changes need no package bump when distributed UI files are unchanged. Compatible package fixes need a patch Changeset; new public components need a minor Changeset. Breaking changes need a major release after 1.0, or a minor release while the package is below 1.0. The check requires a Changeset for package changes and rejects insufficient version bumps. Review prop and behavioral compatibility when choosing the level.

## Release and tag

1. Merge the completed feature with its Changeset and verify main CI and Chromatic.
2. Create a separate `release/vX.Y.Z` branch from main. Run `pnpm version:packages` to apply pending Changesets. Check the resulting package version and changelog.
3. Run the validation commands, commit the version changes, and open a release PR. Merge it with **Create a merge commit** after its checks pass.
4. Wait for the Storybook workflow and Chromatic to pass on the exact merged release commit on main. Update the local main checkout and tag that commit using the matching package version:

   ```sh
   git fetch origin main
   git switch main
   git pull --ff-only origin main
   release_version=$(node -p "require('./packages/ui/package.json').version")
   git tag -a "v$release_version" HEAD -m "Release v$release_version"
   git push origin "refs/tags/v$release_version"
   ```

5. Verify **Publish UI package release** succeeded and download the release archive. The workflow checks version, license, exports, types, and styles before and after upload. Run `pnpm test:package /path/to/downloaded-package.tgz` for a consumer check. Do not move existing tags. For an existing tag with a missing asset, run the release workflow manually from main with that tag.

## Demo workspace

`/demos/<slug>/` is the gallery's canonical demo URL. HTML demos run as native documents; React demos render directly and load preview code only on demo routes. Both use `demos/shared/workspace.css` and the same metadata-driven floating controls from `demos/shared/appearance.js`. The title, description, technology, and source/documentation links come from the catalog. The gallery header/footer stay on the collection page.

The build plugin in `apps/demo/build/` emits static pages and serves the same routes in development. Existing `/vanilla/<slug>/` and `/examples/<slug>/` URLs keep working with the same workspace. `?embedded=1` hides metadata and controls for thumbnail generation. No iframe sizing or appearance-message protocol is needed.

## Themes

Import `@gbgabiola/ui/styles.css` and wrap components in `.uik-theme` with `data-theme="light"` or `"dark"` and `data-palette`. Palettes are Classic, Ocean, Teal, Forest, Plum, Walnut, Ember, and Crimson. The consuming app owns theme state; the gallery starts with the system preference and saves sun/moon choices.

Customize `--uik-surface`, `--uik-text`, `--uik-muted`, `--uik-border`, `--uik-accent`, `--uik-danger`, and `--uik-radius` on the wrapper. `--uik-switch-accent` and `--uik-switch-on-accent` optionally customize the switch. See each component's Storybook Docs page for props and examples.
