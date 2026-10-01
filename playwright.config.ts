import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:3107', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run start -- --hostname 127.0.0.1 --port 3107',
    url: 'http://127.0.0.1:3107',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
});
