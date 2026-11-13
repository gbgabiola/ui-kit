import { TextInput } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

const meta = {
  title: 'Components/Forms/Text Input',
  id: 'text-input',
  component: TextInput,
  args: { label: 'Email address', type: 'email', autoComplete: 'email' },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { hint: 'We’ll send your receipt here.' },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: args.label });
    await expect(input).toHaveAccessibleDescription(args.hint);
    await userEvent.type(input, 'alex@example.com');
    await expect(input).toHaveValue('alex@example.com');
    await userEvent.clear(input);
  },
};
export const Invalid: Story = {
  args: { defaultValue: 'alex', error: 'Enter a complete email address.' },
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole('textbox', { name: args.label });
    await expect(input).toBeInvalid();
    await expect(input).toHaveAccessibleDescription(args.error);
  },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: 'alex@example.com' } };
