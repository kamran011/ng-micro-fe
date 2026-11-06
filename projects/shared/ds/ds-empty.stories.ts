import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { DsEmpty } from './ds-empty';

const meta: Meta<DsEmpty> = {
  title: 'Components/Empty state',
  component: DsEmpty,
  tags: ['autodocs'],
  args: { title: 'No conversations match', hint: 'Clear the search or switch the status filter.' },
  decorators: [componentWrapperDecorator((s) => `<div style="max-width:420px">${s}</div>`)],
};
export default meta;
type Story = StoryObj<DsEmpty>;

export const Default: Story = {};
export const TitleOnly: Story = { args: { hint: '' } };
