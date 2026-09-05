import type { Preview } from '@storybook/nextjs-vite';

import '../app/globals.css';
import '../app/design-system.css';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'todo',
    },
    controls: {
      expanded: true,
    },
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
};

export default preview;
