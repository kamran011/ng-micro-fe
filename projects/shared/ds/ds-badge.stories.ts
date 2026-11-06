import type { Meta, StoryObj } from '@storybook/angular';
import { DsBadge } from './ds-badge';

const meta: Meta<DsBadge> = {
  title: 'Components/Badge',
  component: DsBadge,
  tags: ['autodocs'],
  argTypes: { tone: { control: 'select', options: ['neutral', 'ok', 'warn', 'crit', 'info', 'accent'] } },
  render: (args) => ({ props: args, template: `<ds-badge [tone]="tone">Label</ds-badge>` }),
};
export default meta;
type Story = StoryObj<DsBadge>;

export const Neutral: Story = { args: { tone: 'neutral' } };
export const Ok: Story = { args: { tone: 'ok' } };

/** Every tone side by side. Each has its own glyph, so colour is never the only signal. */
export const AllTones: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <ds-badge tone="neutral">neutral</ds-badge>
        <ds-badge tone="ok">healthy</ds-badge>
        <ds-badge tone="warn">degraded</ds-badge>
        <ds-badge tone="crit">breaching</ds-badge>
        <ds-badge tone="info">info</ds-badge>
        <ds-badge tone="accent">accent</ds-badge>
      </div>`,
  }),
};
