import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4200',
    launchOptions: process.env['CHROME_PATH'] ? { executablePath: process.env['CHROME_PATH'] } : {},
  },
  // Shell + all three remotes must be up for federation to resolve.
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4203/remoteEntry.json',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
