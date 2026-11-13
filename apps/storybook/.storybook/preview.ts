import type { Preview } from '@storybook/react-vite';
import '@gbgabiola/ui/styles.css';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    a11y: { test: 'error' },
    options: { storySort: { order: ['Guides', 'Components', 'Blocks', 'Examples'] } },
  },
};

export default preview;
