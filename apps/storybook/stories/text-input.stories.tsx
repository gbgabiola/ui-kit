import { TextInput } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: TextInput,
  args: { label: 'Email address', type: 'email', autoComplete: 'email' },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { hint: 'We’ll send your receipt here.' } };
export const Invalid: Story = {
  args: { defaultValue: 'alex', error: 'Enter a complete email address.' },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: 'alex@example.com' } };
