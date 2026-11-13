import { SiteFooter } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const meta = {
  title: 'Blocks/Site Footer',
  component: SiteFooter,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GroupedLinks: Story = {
  args: {
    brand: 'Oak Studio',
    description: 'Furniture and interiors',
    linkGroups: [
      { label: 'Explore', links: [{ href: '#projects', label: 'Projects' }] },
      { label: 'Support', links: [{ href: '#contact', label: 'Contact' }] },
    ],
    bottom: '© Oak Studio',
  },
  play: async ({ canvas }) => {
    const footer = within(canvas.getByRole('contentinfo'));
    const explore = within(footer.getByRole('navigation', { name: 'Explore' }));
    const support = within(footer.getByRole('navigation', { name: 'Support' }));
    await expect(explore.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '#projects');
    await expect(support.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact');
  },
};

export const BrandOnly: Story = { args: { brand: 'Oak Studio' } };
