import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { DsSparkline } from './ds-sparkline';

const meta: Meta<DsSparkline> = {
  title: 'Components/Sparkline',
  component: DsSparkline,
  tags: ['autodocs'],
  decorators: [componentWrapperDecorator((s) => `<div style="width:220px">${s}</div>`)],
};
export default meta;
type Story = StoryObj<DsSparkline>;

export const Rising: Story = { args: { data: [3, 5, 4, 7, 6, 9, 8, 12, 10, 14] } };
export const Spiky: Story = { args: { data: [4, 4, 5, 4, 22, 5, 4, 4, 19, 5, 4] } };
export const TooFewPoints: Story = { args: { data: [5] }, parameters: { docs: { description: { story: 'Fewer than two points renders nothing, safely.' } } } };
