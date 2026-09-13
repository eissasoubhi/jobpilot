import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OfflineState } from './UI';

const meta = {
  title: 'Feedback/OfflineState',
  component: OfflineState,
  tags: ['autodocs'],
  args: {
    title: 'JobPilot ne peut pas charger les offres',
    message: 'Vérifiez que l’API locale est démarrée, puis réessayez.',
    onRetry: () => undefined,
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

export const Recoverable: Story = {};

export const WithTechnicalDetail: Story = {
  args: {
    message: 'Les offres restent indisponibles pour le moment. Relancez la connexion après avoir vérifié le service local.',
    technicalDetail: 'GET /api/job-offers → ECONNREFUSED',
  },
};

export const CustomRecoveryAction: Story = {
  args: {
    title: 'La synchronisation locale est indisponible',
    message: 'Aucune donnée n’a été modifiée. Vous pouvez relancer la vérification quand le service est de nouveau accessible.',
    retryLabel: 'Vérifier à nouveau',
  },
};
