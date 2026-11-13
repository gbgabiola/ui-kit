import { Checkbox } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

const meta = {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  args: { label: 'Send me project updates', name: 'updates', hint: 'You can unsubscribe any time.' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('checkbox', { name: 'Send me project updates' });
    await expect(field).toHaveAccessibleDescription('You can unsubscribe any time.');
    await userEvent.click(canvas.getByText('Send me project updates', { exact: true }));
    await expect(field).toBeChecked();
    await expect(field).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await expect(field).not.toBeChecked();
  },
};

export const Invalid: Story = {
  args: { label: 'I agree to the terms', hint: undefined, error: 'Accept the terms to continue.' },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('checkbox', { name: 'I agree to the terms' });
    await expect(field).toBeInvalid();
    await expect(field).toHaveAccessibleDescription('Accept the terms to continue.');
  },
};
