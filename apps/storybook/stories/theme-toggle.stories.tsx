import { useState } from 'react';
import { ThemeToggle, type Theme } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

function ThemeExample({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState(initialTheme);

  return (
    <div className="uik-theme" data-theme={theme} style={{ padding: '1rem' }}>
      <ThemeToggle theme={theme} onThemeChange={setTheme} />
      <p>Current theme: {theme}</p>
    </div>
  );
}

const meta = { component: ThemeExample } satisfies Meta<typeof ThemeExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = { args: { initialTheme: 'light' } };
export const Dark: Story = { args: { initialTheme: 'dark' } };
