import isChromatic from 'chromatic/isChromatic';
import { ProgressBar } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

const meta = {
  title: 'Components/Feedback/Progress Bar',
  component: ProgressBar,
  args: { label: 'Upload progress' },
  decorators: [(Story) => <div style={{ width: 'min(24rem, 80vw)' }}><Story /></div>],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Determinate: Story = {
  args: { value: 3, max: 5 },
  play: async ({ args, canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: args.label });
    await expect(bar).toHaveAttribute('value', '3');
    await expect(bar).toHaveAttribute('max', '5');
  },
};

export const Indeterminate: Story = {
  args: { label: 'Preparing upload' },
  decorators: [(Story) => isChromatic() ? (
    <div className="progress-snapshot">
      <style>{`
        .progress-snapshot progress {
          appearance: none;
          border: 0;
          border-radius: 0.25rem;
          background: linear-gradient(90deg, var(--uik-accent, #254bb3) 30%, var(--uik-border, #68778d) 30%);
        }

        .progress-snapshot progress::-webkit-progress-inner-element {
          visibility: hidden;
        }

        .progress-snapshot progress::-moz-progress-bar {
          visibility: hidden;
        }
      `}</style>
      <Story />
    </div>
  ) : <Story />],
  play: async ({ args, canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: args.label });
    await expect(bar).not.toHaveAttribute('value');
  },
};
