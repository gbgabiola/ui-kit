import { Select } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  args: {
    label: 'Project type',
    name: 'projectType',
    defaultValue: '',
    children: (
      <>
        <option value="" disabled>Choose a project type</option>
        <optgroup label="Services">
          <option value="design">Design</option>
          <option value="installation">Installation</option>
        </optgroup>
      </>
    ),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Project type' });
    await userEvent.selectOptions(field, 'design');
    await expect(field).toHaveValue('design');
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'installation' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Project type' })).toBeDisabled();
  },
};
