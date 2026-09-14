import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { OfflineState } from './UI';

const meta = {
  title: 'Feedback/OfflineState',
  component: OfflineState,
  tags: ['autodocs'],
  args: {
    title: 'JobPilot ne peut pas charger les offres',
    message: 'Vérifiez que l’API locale est démarrée, puis réessayez.',
    onRetry: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'État de récupération partagé quand une surface JobPilot dépend d’un service local indisponible. Le message explique l’impact et l’action utile avant de révéler un diagnostic technique éventuel.',
      },
    },
  },
} satisfies Meta<typeof OfflineState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recoverable: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');
    const retry = canvas.getByRole('button', { name: 'Réessayer' });

    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveTextContent('JobPilot ne peut pas charger les offres');
    await expect(retry).toBeEnabled();
    await userEvent.click(retry);
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

export const WithTechnicalDetail: Story = {
  args: {
    message: 'Les offres restent indisponibles pour le moment. Relancez la connexion après avoir vérifié le service local.',
    technicalDetail: 'GET /api/job-offers → ECONNREFUSED',
    onRetry: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('status')).toHaveTextContent('Détail technique : GET /api/job-offers → ECONNREFUSED');
  },
};

export const CustomRecoveryAction: Story = {
  args: {
    title: 'La synchronisation locale est indisponible',
    message: 'Aucune donnée n’a été modifiée. Vous pouvez relancer la vérification quand le service est de nouveau accessible.',
    retryLabel: 'Vérifier à nouveau',
    onRetry: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Vérifier à nouveau' })).toBeEnabled();
  },
};

export const LongContentOnNarrowViewport: Story = {
  args: {
    title: 'Connexion au service de synchronisation temporairement indisponible',
    message:
      'JobPilot conserve les offres et candidatures déjà chargées. Réessayez lorsque le service local est de nouveau accessible ; aucune candidature externe ne sera envoyée pendant cette indisponibilité.',
    technicalDetail:
      'Le service local n’a pas répondu après plusieurs secondes. Vérifiez que les conteneurs JobPilot sont démarrés avant de relancer.',
    onRetry: fn(),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('status')).toHaveTextContent('aucune candidature externe ne sera envoyée');
    await expect(canvas.getByRole('button', { name: 'Réessayer' })).toBeVisible();
  },
};
