import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**', '**/dist/**', '**/.git/**', '**/storybook-static/**',
    '**/coverage/**', '**/test-results/**', '**/playwright-report/**',
  ]),
  {
    name: 'javascript',
    files: ['**/*.{js,mjs,ts,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.es2026 },
    rules: { 'no-unused-vars': ['error', { ignoreRestSiblings: true }] },
  },
  {
    name: 'typescript',
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
  },
  {
    name: 'react-hooks',
    files: ['**/*.tsx', 'apps/demo/src/theme/*.ts'],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    name: 'node-tooling',
    files: ['scripts/**/*.mjs', '**/*.config.{ts,mjs}', 'apps/demo/build/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    name: 'browser-source',
    files: ['apps/**/src/**/*.{ts,tsx}', 'packages/ui/src/**/*.{ts,tsx}', 'examples/react-consumer/*.tsx', 'demos/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    name: 'browser-tests-and-stories',
    files: ['**/tests/**/*.ts', '**/stories/**/*.tsx', 'apps/storybook/.storybook/*.ts'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    name: 'serialized-browser-callbacks',
    files: ['scripts/shared/demo-browser.mjs', 'scripts/demos/generate-demo-previews.mjs'],
    languageOptions: { globals: globals.browser },
  },
  {
    name: 'native-browser-scripts',
    files: ['demos/native/**/*.js'],
    languageOptions: { sourceType: 'script', globals: { $: 'readonly' } },
  },
]);
