import { signal } from '@angular/core';
import { applicationConfig, type Preview } from '@storybook/angular';
import { SHELL_API, standaloneShellApi } from '@convo/contract';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import 'material-symbols/outlined.css';

/** Mirrors the shell's theme signal so ds-chart re-themes inside stories. */
const theme = signal<'light' | 'dark'>('light');

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: { title: 'Theme', icon: 'paintbrush', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    applicationConfig({
      providers: [{ provide: SHELL_API, useFactory: () => ({ ...standaloneShellApi(), theme }) }],
    }),
    (story, ctx) => {
      const t = (ctx.globals['theme'] as 'light' | 'dark') ?? 'light';
      document.documentElement.setAttribute('data-theme', t);
      theme.set(t);
      return story();
    },
  ],
  parameters: {
    layout: 'padded',
    backgrounds: { disabled: true },
    controls: { matchers: { color: /(background|color)$/i } },
    a11y: { test: 'error' },
  },
};

export default preview;
