import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { InboxSenderClassificationCorrection } from './InboxSenderClassificationCorrection';

const meta = {
  title: 'Messages/Inbox sender classification correction',
  component: InboxSenderClassificationCorrection,
  parameters: {
    docs: {
      description: {
        component:
          'Correction explicite de classification d’un expéditeur dans la boîte de réception JobPilot. Le contrôle reste secondaire, explique que la préférence sera réutilisée pour les prochains messages et n’apparaît que pour les catégories éligibles.',
      },
    },
  },
  args: {
    messageId: 142,
    sender: 'recrutement@entreprise.example',
    category: 'RECRUITER_OPPORTUNITY',
    onSaved: () => undefined,
  },
} satisfies Meta<typeof InboxSenderClassificationCorrection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RecruiterOpportunity: Story = {};

export const UnknownSender: Story = {
  args: {
    category: 'UNKNOWN',
    sender: 'notifications@plateforme-emploi.example',
  },
};

export const LongSenderAddress: Story = {
  args: {
    sender: 'alertes-emploi-personnalisees-equipe-recrutement@notifications.entreprise-example.example',
  },
};
