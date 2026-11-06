import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

interface Entry { id: string; type: 'story' | 'docs'; title: string; name: string }

const indexPath = 'storybook-static/index.json';
if (!existsSync(indexPath)) throw new Error('Run `npm run build-storybook` before the visual tests.');

const stories = Object.values((JSON.parse(readFileSync(indexPath, 'utf8')) as { entries: Record<string, Entry> }).entries).filter(
  (e) => e.type === 'story',
);

for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    for (const s of stories) {
      test(`${s.title} / ${s.name}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${s.id}&viewMode=story&globals=theme:${theme}`);
        const root = page.locator('#storybook-root');
        await expect(root.locator(':scope > *')).not.toHaveCount(0);
        await expect(page.locator('body.sb-show-errordisplay')).toHaveCount(0);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForLoadState('networkidle');
        // Canvas charts paint after layout; give them a frame to settle.
        if (await page.locator('canvas').count()) await page.waitForTimeout(400);
        await expect(root).toHaveScreenshot(`${theme}/${s.id}.png`);
      });
    }
  });
}
