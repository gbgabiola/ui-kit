import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './demo-tests',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.DEMO_BASE_URL || 'http://127.0.0.1:6008/ui-kit/',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: process.env.DEMO_BASE_URL ? undefined : {
    command: 'pnpm --filter ui-kit-demo exec vite preview --host 127.0.0.1 --port 6008 --strictPort',
    url: 'http://127.0.0.1:6008/ui-kit/',
  },
});
