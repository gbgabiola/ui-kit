import { Sidebar } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const meta = {
  title: 'Blocks/Sidebar',
  id: 'sidebar',
  component: Sidebar,
  args: {
    label: 'Account',
    links: [
      { href: '#overview', label: 'Overview', current: true },
      { href: '#projects', label: 'Projects' },
      { href: '#settings', label: 'Settings' },
    ],
  },
  decorators: [(Story) => <div style={{ width: 'min(18rem, 80vw)' }}><Story /></div>],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Account' });
    const navigation = canvas.getByRole('navigation', { name: 'Account' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-controls', navigation.id);
    await expect(within(navigation).getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  },
};

export const Collapsed: Story = {
  args: { defaultOpen: false },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Account' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('navigation', { name: 'Account' })).not.toBeInTheDocument();

    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Overview' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('link', { name: 'Overview' })).not.toBeInTheDocument();
  },
};

export const DarkWalnut: Story = {
  decorators: [(Story) => <div className="uik-theme" data-theme="dark" data-palette="walnut"><Story /></div>],
};
