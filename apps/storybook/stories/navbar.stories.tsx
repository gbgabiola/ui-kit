import { useState } from 'react';
import { Navbar, ThemeToggle, type NavbarProps, type Theme } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

function NavbarExample(props: NavbarProps) {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <div className="uik-theme" data-theme={theme}>
      <Navbar {...props} actions={<ThemeToggle theme={theme} onThemeChange={setTheme} />} />
    </div>
  );
}

const meta = {
  title: 'Blocks/Navbar',
  id: 'navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brand: 'Acme',
    links: [
      { href: '#home', label: 'Home', current: true },
      { href: '#pricing', label: 'Pricing' },
      { href: '#blog', label: 'Blog' },
    ],
  },
  render: (args) => <NavbarExample {...args} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: 'Main' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  },
};
