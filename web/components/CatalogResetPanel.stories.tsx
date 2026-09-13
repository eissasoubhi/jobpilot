import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CatalogResetPanel } from './CatalogResetPanel';

const meta = {
  title: 'Settings/CatalogResetPanel',
  component: CatalogResetPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Zone dangereuse de JobPilot pour réinitialiser le catalogue local. Les stories couvrent le verrouillage explicite, le déverrouillage par confirmation textuelle et la confirmation destructive finale sans appeler l’API de suppression.',
      },
    },
  },
} satisfies Meta<typeof CatalogResetPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Locked: Story = {
  name: 'Locked destructive action',
  parameters: {
    docs: {
      description: {
        story:
          'État par défaut : l’action destructive reste verrouillée tant que la phrase de confirmation exacte n’a pas été saisie.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const resetButton = canvas.getByRole('button', { name: 'Supprimer et resynchroniser' });

    await expect(resetButton).toBeDisabled();
    await expect(canvas.getByText('REINITIALISER')).toBeVisible();
    await expect(canvas.getByText(/candidatures déjà marquées comme envoyées/)).toBeVisible();
  },
};

export const ConfirmationEntered: Story = {
  name: 'Confirmation entered',
  parameters: {
    docs: {
      description: {
        story:
          'La phrase exacte déverrouille l’action, tout en gardant les conséquences visibles avant la confirmation finale.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Confirmation de réinitialisation des offres' });
    const resetButton = canvas.getByRole('button', { name: 'Supprimer et resynchroniser' });

    await userEvent.type(input, 'REINITIALISER');
    await expect(resetButton).toBeEnabled();
  },
};

export const DestructiveConfirmationDialog: Story = {
  name: 'Final destructive confirmation',
  parameters: {
    docs: {
      description: {
        story:
          'La deuxième étape nomme explicitement les données supprimées et conservées. La story s’arrête avant la confirmation et n’appelle donc jamais l’API destructive.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Confirmation de réinitialisation des offres' });

    await userEvent.type(input, 'REINITIALISER');
    await userEvent.click(canvas.getByRole('button', { name: 'Supprimer et resynchroniser' }));

    const body = within(document.body);
    const dialog = await body.findByRole('dialog');

    await expect(dialog).toHaveTextContent('Supprimer le catalogue et les candidatures liées ?');
    await expect(dialog).toHaveTextContent('Le profil, les CV, les paramètres et les connecteurs seront conservés.');
    await expect(within(dialog).getByRole('button', { name: 'Supprimer et resynchroniser' })).toBeEnabled();
    await expect(within(dialog).getByRole('button', { name: 'Annuler' })).toBeEnabled();
  },
};
