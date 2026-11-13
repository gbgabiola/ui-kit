import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  plugins: [
    storybookTest({
      configDir: fileURLToPath(new URL('.storybook', import.meta.url)),
      storybookScript: 'pnpm dev --no-open',
    }),
  ],
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    coverage: {
      provider: 'v8',
      allowExternal: true,
      include: ['**/packages/ui/src/{components,blocks}/**/*.tsx'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
}));
