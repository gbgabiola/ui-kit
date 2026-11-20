import { useState } from 'react';
import { Button } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';

const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  args: { children: 'Add item', onClick: fn() },
  decorators: [(Story, { parameters }) => <div className="uik-theme" data-theme={parameters.theme ?? 'light'} data-palette={parameters.palette ?? 'classic'} style={{ padding: '1rem' }}><Story /></div>],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { className: 'consumer-action', name: 'action', value: 'add' },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Add item' });
    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toHaveAttribute('name', 'action');
    await expect(button).toHaveAttribute('value', 'add');
    await expect(button).toHaveClass('consumer-action');
    await userEvent.click(button);
    await expect(button).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await userEvent.keyboard('[Enter]');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancel' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Unavailable' },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Unavailable' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const FormSubmission: Story = {
  args: { type: 'submit', children: 'Save changes' },
  render: function Example(args) {
    const [saved, setSaved] = useState(false);
    return (
      <form onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
        <Button {...args} />
        <p role="status">{saved ? 'Changes saved.' : ''}</p>
      </form>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Changes saved.');
  },
};

export const Variants: Story = {
  render: (args) => (
    <div role="group" aria-label="Button variants" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      <Button {...args}>Save changes</Button>
      <Button variant="secondary">Cancel</Button>
      <Button disabled>Unavailable</Button>
    </div>
  ),
};

export const DarkWalnut: Story = {
  ...Variants,
  parameters: { theme: 'dark', palette: 'walnut' },
};
