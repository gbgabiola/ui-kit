import { ContentCard } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

const meta = {
  title: 'Blocks/Content Card',
  component: ContentCard,
  args: { title: 'Reading nook', description: 'Built-in shelving for a small room.' },
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('article')).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Reading nook', level: 3 })).toBeVisible();
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};

export const WithMediaAndActions: Story = {
  args: {
    eyebrow: 'Project',
    href: '#reading-nook',
    metadata: 'Oak · 2026',
    media: (
      <div aria-hidden="true" style={{ height: '8rem', background: 'var(--uik-accent, #254bb3)' }} />
    ),
    actions: <button type="button" className="uik-button">Save project</button>,
  },
  play: async ({ canvas, userEvent }) => {
    const link = canvas.getByRole('link', { name: 'Reading nook' });
    const action = canvas.getByRole('button', { name: 'Save project' });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.tab();
    await expect(action).toHaveFocus();
  },
};
