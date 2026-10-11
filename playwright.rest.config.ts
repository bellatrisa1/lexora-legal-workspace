import { defineConfig, devices } from '@playwright/test';
if (!process.env.TEST_DATABASE_URL)
  throw new Error('TEST_DATABASE_URL must point to an isolated seeded test database');
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'rest.spec.ts',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3108', trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'npx tsx server/index.ts',
      url: 'http://127.0.0.1:4001/health',
      reuseExistingServer: false,
      env: {
        DATABASE_URL: process.env.TEST_DATABASE_URL,
        DEMO_API_ENABLED: 'true',
        API_PORT: '4001',
        APP_ORIGIN: 'http://127.0.0.1:3108',
        NODE_ENV: 'development',
      },
    },
    {
      command: 'npm run start -- --hostname 127.0.0.1 --port 3108',
      url: 'http://127.0.0.1:3108',
      reuseExistingServer: false,
      env: { NEXT_PUBLIC_API_MODE: 'rest', API_INTERNAL_URL: 'http://127.0.0.1:4001' },
    },
  ],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
});
