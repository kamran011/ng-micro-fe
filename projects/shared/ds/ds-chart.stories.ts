import type { Meta, StoryObj } from '@storybook/angular';
import { DsChart } from './ds-chart';

// Fixed series: stories (and their visual baselines) must be deterministic.
const labels = Array.from({ length: 40 }, (_, i) => `12:${String(i).padStart(2, '0')}`);
const p50 = labels.map((_, i) => Math.round(180 + Math.sin(i / 3) * 24));
const p95 = p50.map((v, i) => Math.round(v * 2.2 + (i === 18 || i === 27 ? 260 : 0)));

const meta: Meta<DsChart> = {
  title: 'Components/Chart',
  component: DsChart,
  tags: ['autodocs'],
  decorators: [(s) => ({ ...s(), template: `<div style="max-width:720px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:16px"><story /></div>` })],
  parameters: { docs: { description: { component: 'Themed ECharts wrapper. `label` and `summary` are required: they are the accessible text equivalent of the canvas.' } } },
};
export default meta;
type Story = StoryObj<DsChart>;

export const Latency: Story = {
  args: {
    label: 'Latency percentiles over time',
    summary: 'p50 around 180 ms, p95 around 400 ms with two spikes above the 450 ms SLO.',
    option: {
      animation: false,
      xAxis: { type: 'category', data: labels, boundaryGap: false, axisLabel: { interval: 7 } },
      yAxis: { type: 'value', name: 'ms' },
      series: [
        { name: 'p50', type: 'line', showSymbol: false, smooth: true, data: p50 },
        {
          name: 'p95', type: 'line', showSymbol: false, smooth: true, data: p95,
          markLine: { silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#b3361f' }, data: [{ yAxis: 450 }] },
        },
      ],
    },
  },
};

export const Throughput: Story = {
  args: {
    label: 'Requests per second over time',
    summary: 'Throughput oscillates between about 330 and 520 requests per second.',
    option: {
      animation: false,
      xAxis: { type: 'category', data: labels, boundaryGap: false, axisLabel: { interval: 7 } },
      yAxis: { type: 'value', name: 'req/s' },
      series: [{ type: 'line', showSymbol: false, areaStyle: { opacity: 0.12 }, data: labels.map((_, i) => Math.round(420 + Math.sin(i / 4) * 90)) }],
    },
  },
};

export const PipelineBars: Story = {
  args: {
    label: 'Pipeline value by stage',
    summary: 'Discovery $100k, Qualified $362k, Proposal $214k, Negotiation $84k, Won $18k.',
    option: {
      animation: false,
      grid: { left: 90, right: 24, top: 8, bottom: 24 },
      xAxis: { type: 'value', axisLabel: { formatter: (v: number) => `$${v / 1000}k` } },
      yAxis: { type: 'category', inverse: true, data: ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won'], axisLine: { show: false }, splitLine: { show: false } },
      series: [{ type: 'bar', barWidth: 18, itemStyle: { borderRadius: [0, 3, 3, 0] }, data: [100000, 362000, 214000, 84000, 18000] }],
    },
  },
};
