import { defineConfig } from '@playwright/test';

// Visual regression for the design system: every Storybook story, light + dark.
// Baselines are platform-specific (fonts/AA), so they are generated on Linux/Chromium.
// Update with `npm run test:visual:update` after an intentional visual change.
export default defineConfig({
  testDir: './e2e-visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-visual' }]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide' } },
  use: {
    baseURL: 'http://localhost:6007',
    viewport: { width: 900, height: 700 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    launchOptions: process.env['CHROME_PATH'] ? { executablePath: process.env['CHROME_PATH'] } : {},
  },
  webServer: {
    command: 'npx http-server storybook-static -p 6007 -s',
    url: 'http://localhost:6007/iframe.html',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
