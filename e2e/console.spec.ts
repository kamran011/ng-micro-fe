import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = ['cockpit', 'studio', 'telemetry', 'system', 'architecture'];

test.describe('shell + remotes', () => {
  test('discovers and mounts every remote', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('3/3 remotes online')).toBeVisible();
    for (const [link, heading] of [['Studio', 'Studio'], ['Telemetry', 'Telemetry'], ['Sales Cockpit', 'Sales Cockpit']]) {
      await page.getByRole('link', { name: link }).click();
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    }
  });

  test('a remote that is down degrades to a fallback; the rest keeps working', async ({ page }) => {
    await page.route('**://localhost:4203/**', (r) => r.abort());
    await page.goto('/telemetry');
    await expect(page.getByRole('alert')).toContainText('telemetry is unavailable');
    await expect(page.getByText('2/3 remotes online')).toBeVisible();
    await page.getByRole('link', { name: 'Studio' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Studio' })).toBeVisible();
  });

  for (const route of ROUTES) {
    test(`no serious accessibility violations on /${route}`, async ({ page }) => {
      await page.goto('/' + route);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.waitForTimeout(600);
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(blocking.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
});

test.describe('critical workflows', () => {
  test('cockpit: open a thread, use the suggestion, send, change stage', async ({ page }) => {
    await page.goto('/cockpit');
    await page.getByRole('button', { name: /Hannah Whitcombe/ }).click();
    await page.getByRole('button', { name: 'Use as draft' }).click();
    await expect(page.getByLabel(/Reply to Hannah/)).toHaveValue(/Salesforce connector/);
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByRole('log')).toContainText('Salesforce connector');
    await page.getByRole('combobox', { name: 'Stage' }).click();
    await page.getByRole('option', { name: 'Proposal' }).click();
    await expect(page.getByText('Lumen Retail moved to Proposal')).toBeVisible();
  });

  test('studio: validation blocks publish until fixed, then publishes', async ({ page }) => {
    await page.goto('/studio');
    await page.getByRole('button', { name: /Renewal concierge/ }).click();
    const publish = page.getByRole('button', { name: 'Publish…' });
    await expect(publish).toBeDisabled();
    await expect(page.getByText('“Usage summary” has an empty prompt.')).toBeVisible();
    await page.getByRole('button', { name: /^2 Usage summary/ }).click();
    await page.getByLabel('Prompt').fill('Summarise seat usage and active conversations for the last 30 days.');
    await expect(publish).toBeEnabled();
    await publish.click();
    await page.getByRole('button', { name: /Publish v4/ }).click();
    await expect(page.getByText('Renewal concierge published as v4')).toBeVisible();
  });

  test('studio: reorder with the keyboard-accessible controls', async ({ page }) => {
    await page.goto('/studio');
    const first = page.getByRole('list', { name: 'Flow steps' }).getByRole('listitem').first();
    await expect(first).toContainText('Welcome');
    await page.getByRole('button', { name: 'Move Welcome down' }).click();
    await expect(first).toContainText('Company size');
  });

  test('telemetry: switching service updates the view', async ({ page }) => {
    await page.goto('/telemetry');
    await page.getByRole('button', { name: 'nlu-intent' }).click();
    await expect(page.getByText('nlu-intent owned by ML Platform')).toBeVisible();
  });
});
