import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../projects/shared/ds/**/*.stories.ts'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: { name: '@storybook/angular', options: {} },
  core: { disableTelemetry: true },
};

export default config;
