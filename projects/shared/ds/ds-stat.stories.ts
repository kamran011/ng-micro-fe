import type { Meta, StoryObj } from '@storybook/angular';
import { DsStat } from './ds-stat';

const SPARK = [3, 5, 4, 7, 6, 9, 8, 12, 10, 14];

const meta: Meta<DsStat> = {
  title: 'Components/Stat',
  component: DsStat,
  tags: ['autodocs'],
  args: { label: 'p95 latency', value: 312, unit: 'ms', delta: 'SLO 450 ms', trend: 'good', spark: null },
  decorators: [(s) => ({ ...s(), template: `<div style="max-width:260px"><story /></div>` })],
};
export default meta;
type Story = StoryObj<DsStat>;

export const Default: Story = {};
export const WithSparkline: Story = { args: { spark: SPARK } };
export const BadTrend: Story = { args: { label: 'Error rate', value: '1.8', unit: '%', delta: '+0.9 pts', trend: 'bad' } };
export const NoDelta: Story = { args: { label: 'Live conversations', value: 3, unit: '', delta: '' } };
