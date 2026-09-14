import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ConfirmDialog } from './ConfirmDialog';

const meta = {
  title: 'Feedback/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Confirmation contract for consequential JobPilot actions. Dialogs expose their title and consequence to assistive technology, keep destructive and primary actions distinct, and block dismissal while an operation is in progress.',
      },
    },
  },
  args: {
    open: true,
    title: 'Supprimer cette candidature ?',
    description: 'Cette action retire définitivement la candidature de JobPilot.',
    confirmLabel: 'Supprimer',
    cancelLabel: 'Annuler',
    onConfirm: fn(),
    onCancel: fn(),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Danger: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole('dialog');
    const title = canvas.getByRole('heading', { name: 'Supprimer cette candidature ?' });
    const description = canvas.getByText('Cette action retire définitivement la candidature de JobPilot.');

    await expect(dialog).toHaveAttribute('aria-labelledby', title.id);
    await expect(dialog).toHaveAttribute('aria-describedby', description.id);
    await expect(canvas.getByRole('button', { name: 'Supprimer' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Annuler' })).toBeEnabled();
  },
};

export const SourceRemoval: Story = {
  args: {
    title: 'Supprimer Example Jobs ?',
    description: 'Cette source sera retirée du registre de scraping JobPilot et ne sera plus disponible pour les prochaines synchronisations.',
    confirmLabel: 'Supprimer la source',
  },
};

export const PrimaryConfirmation: Story = {
  args: {
    title: 'Relancer cette candidature ?',
    description: 'JobPilot enregistrera la relance dans le suivi de la candidature.',
    confirmLabel: 'Confirmer la relance',
    confirmVariant: 'primary',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const confirm = canvas.getByRole('button', { name: 'Confirmer la relance' });

    await userEvent.click(confirm);
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

export const CancelAction: Story = {
  name: 'Cancel action remains explicit',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const cancel = canvas.getByRole('button', { name: 'Annuler' });

    await userEvent.click(cancel);
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};

export const Loading: Story = {
  args: {
    title: 'Suppression en cours',
    description: 'JobPilot termine la suppression. Les actions sont temporairement désactivées.',
    confirmLabel: 'Suppression…',
    loading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Annuler' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Suppression…' })).toBeDisabled();
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const LongContentPressure: Story = {
  name: 'Long consequence on a narrow viewport',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    title: 'Supprimer définitivement cette source de candidatures personnalisée ?',
    description:
      'Cette source et sa configuration locale ne seront plus utilisées lors des prochaines synchronisations. Les offres déjà importées dans JobPilot restent disponibles dans votre historique.',
    confirmLabel: 'Supprimer la source',
  },
};
