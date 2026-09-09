import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ConfirmDialog } from './ConfirmDialog';

const meta = {
  title: 'Feedback/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    open: true,
    title: 'Supprimer cette candidature ?',
    description: 'Cette action retire définitivement la candidature de JobPilot.',
    confirmLabel: 'Supprimer',
    cancelLabel: 'Annuler',
    onConfirm: () => undefined,
    onCancel: () => undefined,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Danger: Story = {};

export const PrimaryConfirmation: Story = {
  args: {
    title: 'Relancer cette candidature ?',
    description: 'JobPilot enregistrera la relance dans le suivi de la candidature.',
    confirmLabel: 'Confirmer la relance',
    confirmVariant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    title: 'Suppression en cours',
    description: 'JobPilot termine la suppression. Les actions sont temporairement désactivées.',
    confirmLabel: 'Suppression…',
    loading: true,
  },
};
