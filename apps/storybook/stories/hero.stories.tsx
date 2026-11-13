import { Hero } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

const meta = {
  title: 'Blocks/Hero',
  component: Hero,
  args: {
    title: 'Build a space that works for you',
    eyebrow: 'Design studio',
    description: 'Furniture and interiors made for everyday use.',
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextOnly: Story = {
  play: async ({ args, canvas }) => {
    const region = canvas.getByRole('region', { name: args.title });
    await expect(region).toBeVisible();
    await expect(canvas.getByRole('heading', { name: args.title, level: 1 })).toBeVisible();
  },
};

export const Split: Story = {
  args: {
    headingLevel: 2,
    actions: <a href="#projects">View projects</a>,
    media: (
      <div
        aria-hidden="true"
        style={{ aspectRatio: '4 / 3', borderRadius: '0.5rem', background: 'var(--uik-accent, #254bb3)' }}
      />
    ),
  },
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('heading', { name: args.title, level: 2 })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'View projects' })).toBeVisible();
  },
};
