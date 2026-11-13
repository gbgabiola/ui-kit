import { useState } from 'react';
import { ThemeToggle, type ThemeToggleProps } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';

function ThemeExample({ theme: initialTheme, onThemeChange, ...props }: ThemeToggleProps) {
  const [theme, setTheme] = useState(initialTheme);

  return (
    <div className="uik-theme" data-theme={theme} style={{ padding: '1rem' }}>
      <ThemeToggle {...props} theme={theme} onThemeChange={(next) => {
        setTheme(next);
        onThemeChange(next);
      }} />
      <p>Current theme: {theme}</p>
    </div>
  );
}

const meta = {
  title: 'Components/Theme/Theme Toggle',
  id: 'theme-toggle',
  component: ThemeToggle,
  args: { onThemeChange: fn() },
  render: (args) => <ThemeExample key={args.theme} {...args} />,
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  args: { theme: 'light' },
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Dark mode' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onThemeChange).toHaveBeenCalledWith('dark');
    await userEvent.keyboard('[Space]');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(args.onThemeChange).toHaveBeenLastCalledWith('light');
  },
};
export const Dark: Story = { args: { theme: 'dark' } };
export const Compact: Story = { args: { theme: 'light', variant: 'icon' } };
export const Disabled: Story = {
  args: { theme: 'dark', disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Dark mode' })).toBeDisabled();
  },
};
