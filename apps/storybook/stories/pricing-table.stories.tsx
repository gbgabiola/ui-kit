import { PricingTable, type PricingPlan } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

const plans: readonly PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    description: 'For personal projects.',
    features: ['One workspace', 'Community support'],
    action: <a href="#starter">Choose Starter</a>,
  },
  {
    id: 'studio',
    name: 'Studio',
    price: '$24',
    period: 'per month',
    description: 'For small teams.',
    features: ['Five workspaces', 'Shared templates', 'Email support'],
    highlight: 'Most popular',
    action: <a href="#studio">Choose Studio</a>,
  },
  {
    id: 'business',
    name: 'Business',
    price: 'Custom pricing',
    description: 'For larger organizations.',
    features: ['Unlimited workspaces', 'Priority support'],
    action: <a href="mailto:sales@example.com">Contact sales</a>,
  },
];

const meta = {
  title: 'Blocks/Pricing Table',
  id: 'pricing-table',
  component: PricingTable,
  parameters: { layout: 'fullscreen' },
  args: { title: 'Choose a plan', description: 'Plans for workspaces of every size.', plans },
} satisfies Meta<typeof PricingTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Comparison: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('region', { name: 'Choose a plan' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Studio', level: 3 })).toBeVisible();
    await expect(canvas.getByText('Most popular')).toBeVisible();
    await expect(canvas.getByText('Shared templates', { selector: 'li' })).toBeVisible();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Choose Starter' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Choose Studio' })).toHaveFocus();
  },
};

export const DarkWalnut: Story = {
  decorators: [(Story) => <div className="uik-theme" data-theme="dark" data-palette="walnut"><Story /></div>],
};

export const SinglePlan: Story = {
  args: { headingLevel: 3, plans: [{ id: 'studio', name: 'Studio', price: '$24', period: 'per month' }] },
};
