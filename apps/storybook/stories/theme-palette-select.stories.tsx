import { useState } from 'react';
import { ThemePaletteSelect, type ThemePaletteSelectProps } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';

function PaletteSelectExample({ palette: initialPalette, onPaletteChange, ...props }: ThemePaletteSelectProps) {
  const [palette, setPalette] = useState(initialPalette);

  return (
    <ThemePaletteSelect {...props} palette={palette} onPaletteChange={(next) => {
      setPalette(next);
      onPaletteChange(next);
    }} />
  );
}

const meta = {
  title: 'Components/Theme/Palette Select',
  component: ThemePaletteSelect,
  args: { palette: 'classic', onPaletteChange: fn() },
  render: (args) => <PaletteSelectExample key={args.palette} {...args} />,
} satisfies Meta<typeof ThemePaletteSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Color palette' });
    await userEvent.selectOptions(select, 'forest');
    await expect(select).toHaveValue('forest');
    await expect(args.onPaletteChange).toHaveBeenCalledWith('forest');
    await userEvent.selectOptions(select, 'classic');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Color palette' })).toBeDisabled();
  },
};
