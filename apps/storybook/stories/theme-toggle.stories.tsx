import { useState } from 'react';
import { ThemeToggle, type ThemeToggleProps } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

type ThemeExampleProps = Pick<ThemeToggleProps, 'variant' | 'disabled'> & {
  initialTheme: ThemeToggleProps['theme'];
};

function ThemeExample({ initialTheme, ...props }: ThemeExampleProps) {
  const [theme, setTheme] = useState(initialTheme);

  return (
    <div className="uik-theme" data-theme={theme} style={{ padding: '1rem' }}>
      <ThemeToggle {...props} theme={theme} onThemeChange={setTheme} />
      <p>Current theme: {theme}</p>
    </div>
  );
}

const meta = { component: ThemeExample } satisfies Meta<typeof ThemeExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = { args: { initialTheme: 'light' } };
export const Dark: Story = { args: { initialTheme: 'dark' } };
export const Compact: Story = { args: { initialTheme: 'light', variant: 'icon' } };
export const Disabled: Story = { args: { initialTheme: 'dark', disabled: true } };
