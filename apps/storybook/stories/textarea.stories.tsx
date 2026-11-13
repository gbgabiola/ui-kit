import { Textarea } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

const meta = {
  title: 'Components/Forms/Textarea',
  component: Textarea,
  args: { label: 'Message', name: 'message', rows: 4, hint: 'Tell us about your project.' },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('textbox', { name: 'Message' });
    await expect(field).toHaveAccessibleDescription('Tell us about your project.');
    await userEvent.type(field, 'First line{Enter}Second line');
    await expect(field).toHaveValue('First line\nSecond line');
    await userEvent.clear(field);
  },
};

export const Invalid: Story = {
  args: { id: 'project-message', error: 'Enter a message.', 'aria-describedby': 'message-policy' },
  render: (args) => (
    <>
      <p id="message-policy">Your message will be shared with the studio.</p>
      <Textarea {...args} />
    </>
  ),
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Message' });
    await expect(field).toBeInvalid();
    await expect(field).toHaveAccessibleDescription(
      'Your message will be shared with the studio. Tell us about your project. Enter a message.',
    );
  },
};
