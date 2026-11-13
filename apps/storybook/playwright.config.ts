import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:6007';

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: '{testDir}/snapshots/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.005 } },
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 900, height: 600 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm exec vite preview --outDir storybook-static --host 127.0.0.1 --port 6007 --strictPort',
    url: baseURL,
  },
});
