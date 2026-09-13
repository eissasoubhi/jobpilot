import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { NotificationCenter } from './NotificationCenter';

type Fixture = {
  connectors: unknown[];
  gmailStatus: Record<string, unknown>;
};

const healthyGmail = {
  connected: true,
  readPermission: true,
  readPermissionMessage: null,
  sendPermission: true,
  sendPermissionMessage: null,
  configured: true,
  missingVariables: [],
  startUrl: '/integrations/gmail/start',
};

const healthyConnector = {
  id: 1,
  code: 'france-travail',
  name: 'France Travail',
  mode: 'API',
  enabled: true,
  configured: true,
  status: 'READY',
  lastError: null,
  health: {
    status: 'HEALTHY',
    alert: false,
    label: 'Opérationnel',
    reasons: [],
  },
};

const actionRequiredFixture: Fixture = {
  connectors: [
    healthyConnector,
    {
      ...healthyConnector,
      id: 2,
      code: 'gmail',
      name: 'Gmail',
      mode: 'GMAIL',
    },
  ],
  gmailStatus: {
    ...healthyGmail,
    connected: false,
    configured: false,
    missingVariables: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
};

const mixedFixture: Fixture = {
  connectors: [
    healthyConnector,
    {
      ...healthyConnector,
      id: 2,
      code: 'gmail',
      name: 'Gmail',
      mode: 'GMAIL',
      lastError: 'Token has been expired or revoked.',
      health: {
        status: 'BROKEN',
        alert: true,
        label: 'Connexion interrompue',
        reasons: ['Token has been expired or revoked.'],
      },
    },
    {
      ...healthyConnector,
      id: 3,
      code: 'welcome-to-the-jungle',
      name: 'Welcome to the Jungle — offres publiques et opportunités éditoriales',
      mode: 'SCRAPING_HTTP',
      status: 'COMPLIANCE_BLOCKED',
      lastError: 'La source interdit la collecte automatisée sur cette route publique. Utilise un canal autorisé ou l’import assisté.',
      health: {
        status: 'DEGRADED',
        alert: true,
        label: 'Collecte limitée',
        reasons: ['La source interdit la collecte automatisée sur cette route publique.'],
      },
    },
  ],
  gmailStatus: {
    ...healthyGmail,
    connected: false,
  },
};

function mockFixture(fixture: Fixture): void {
  if (typeof window !== 'undefined') window.localStorage.clear();

  globalThis.fetch = async (input) => {
    const url = String(input);
    const payload = url.includes('/integrations/gmail/status')
      ? fixture.gmailStatus
      : fixture.connectors;

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

const meta = {
  title: 'Feedback/NotificationCenter',
  component: NotificationCenter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Centre de notifications partagé de JobPilot. Les stories couvrent l’alerte actionnable, le panneau avec plusieurs niveaux de gravité et l’état sans problème actif, avec du contenu long réaliste.',
      },
    },
  },
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActionRequiredToast: Story = {
  render: () => {
    mockFixture(actionRequiredFixture);
    return <NotificationCenter />;
  },
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByRole('status')).toHaveTextContent('Configuration Gmail incomplète');
  },
};

export const MixedOperationalPanel: Story = {
  render: () => {
    mockFixture(mixedFixture);
    return <NotificationCenter />;
  },
  play: async () => {
    const body = within(document.body);
    const bell = await body.findByRole('button', { name: /Notifications/ });
    await userEvent.click(bell);
    const dialog = await body.findByRole('dialog', { name: 'Centre de notifications' });
    await expect(dialog).toHaveTextContent('Gmail doit être reconnecté');
    await expect(dialog).toHaveTextContent('Welcome to the Jungle');
  },
};

export const NoActiveProblem: Story = {
  render: () => {
    mockFixture({ connectors: [healthyConnector], gmailStatus: healthyGmail });
    return <NotificationCenter />;
  },
  play: async () => {
    const body = within(document.body);
    const bell = await body.findByRole('button', { name: 'Notifications' });
    await userEvent.click(bell);
    const dialog = await body.findByRole('dialog', { name: 'Centre de notifications' });
    await expect(dialog).toHaveTextContent('Tout va bien. Aucun problème actif détecté.');
  },
};
