import { defineConfig } from '@playwright/test';

const consumerDir = process.env.UI_KIT_CONSUMER_DIR;
if (!consumerDir) {
  throw new Error('Run pnpm test:package to build the consumer before running browser tests.');
}

const baseURL = 'http://127.0.0.1:6008';

export default defineConfig({
  testDir: './consumer-tests',
  outputDir: './test-results/package-consumer',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    cwd: consumerDir,
    command: './node_modules/.bin/vite preview --host 127.0.0.1 --port 6008 --strictPort',
    url: baseURL,
  },
});
