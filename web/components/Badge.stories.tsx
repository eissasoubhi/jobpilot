import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Badge } from './UI';

const meta = {
  title: 'Data/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'À traiter',
    tone: 'neutral',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Compact JobPilot status label. Keep the status meaning explicit in text so tone never becomes the only signal.',
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('À traiter')).toBeInTheDocument();
  },
};

export const Ready: Story = {
  args: {
    tone: 'good',
    children: 'Prête à envoyer',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Prête à envoyer')).toBeInTheDocument();
  },
};

export const Attention: Story = {
  args: {
    tone: 'warn',
    children: 'À vérifier',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('À vérifier')).toBeInTheDocument();
  },
};

export const Blocking: Story = {
  args: {
    tone: 'bad',
    children: 'Bloquante',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Bloquante')).toBeInTheDocument();
  },
};

export const Informational: Story = {
  args: {
    tone: 'blue',
    children: 'Analyse existante',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Analyse existante')).toBeInTheDocument();
  },
};

export const LongStatusMobile: Story = {
  name: 'Long status · mobile',
  args: {
    tone: 'warn',
    children: 'Informations complémentaires à vérifier avant candidature',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Informations complémentaires à vérifier avant candidature'),
    ).toBeInTheDocument();
  },
};
