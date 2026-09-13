import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';

import type { SourceConnector } from '@/lib/types';

import { SelectiveConnectorSyncPanel } from './SelectiveConnectorSyncPanel';

function connector(overrides: Partial<SourceConnector>): SourceConnector {
  return {
    id: 1,
    code: 'france-travail',
    name: 'France Travail',
    mode: 'API',
    enabled: true,
    configured: true,
    collectionAllowed: true,
    policy: {
      complianceStatus: 'ALLOWED',
      complianceLabel: 'Collecte autorisée',
      collectionAllowed: true,
      minimumDelayMilliseconds: 0,
      respectsRobotsTxt: true,
    },
    health: {
      status: 'HEALTHY',
      label: 'Opérationnel',
      alert: false,
      sampleSize: 12,
      consecutiveZeroRuns: 0,
      reasons: [],
    },
    fieldQuality: {
      received: 42,
      requiredCompleteness: 0.98,
      recommendedCompleteness: 0.91,
      overallCompleteness: 0.95,
      missingRequiredRecords: 0,
      fields: {},
      warnings: [],
    },
    status: 'READY',
    due: true,
    lastResult: {
      received: 42,
      imported: 17,
      merged: 4,
      duplicates: 21,
      failed: 0,
    },
    updatedAt: '2026-09-13T09:30:00+02:00',
    ...overrides,
  };
}

const connectors = [
  connector({ id: 1, code: 'france-travail', name: 'France Travail' }),
  connector({
    id: 2,
    code: 'gmail',
    name: 'Gmail',
    mode: 'GMAIL',
    enabled: false,
    status: 'DISABLED',
  }),
  connector({
    id: 3,
    code: 'custom-browser',
    name: 'Import navigateur personnalisé',
    mode: 'SCRAPING_BROWSER',
    configured: false,
    configurationMessage: 'Configuration requise avant la première synchronisation',
    status: 'NEEDS_CONFIGURATION',
  }),
  connector({
    id: 4,
    code: 'restricted-feed',
    name: 'Source en revue de conformité',
    mode: 'RSS',
    collectionAllowed: false,
    policy: {
      complianceStatus: 'UNDER_REVIEW',
      complianceLabel: 'Collecte en revue',
      collectionAllowed: false,
      note: 'Collecte suspendue jusqu’à validation de la politique de la source',
      minimumDelayMilliseconds: 1000,
      respectsRobotsTxt: true,
    },
    status: 'POLICY_BLOCKED',
  }),
];

const meta = {
  title: 'Synchronization/Selective connector sync panel',
  component: SelectiveConnectorSyncPanel,
  parameters: {
    docs: {
      description: {
        component:
          'Sélection explicite des connecteurs du prochain run manuel. Les connecteurs désactivés, non configurés ou bloqués par politique restent visibles avec leur raison, sans devenir sélectionnables.',
      },
    },
  },
  args: {
    connectors,
    syncing: false,
    onSynchronize: () => undefined,
  },
} satisfies Meta<typeof SelectiveConnectorSyncPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedEligibility: Story = {
  play: async () => {
    const body = within(document.body);
    await userEvent.click(body.getByRole('button', { name: 'Choisir les connecteurs' }));
    await body.findByRole('dialog', { name: 'Choisir les connecteurs à synchroniser' });
  },
};

export const SynchronizationInProgress: Story = {
  args: {
    syncing: true,
  },
};

export const LongConnectorNames: Story = {
  args: {
    connectors: [
      connector({
        id: 5,
        code: 'long-name',
        name: 'Alertes emploi et opportunités personnalisées pour développeurs full-stack expérimentés',
      }),
      connector({
        id: 6,
        code: 'long-disabled-name',
        name: 'Source partenaire avec une configuration volontairement longue pour tester la pression responsive',
        configured: false,
        configurationMessage: 'Ajoute les paramètres requis dans Connecteurs avant de relancer une synchronisation manuelle.',
      }),
    ],
  },
  play: async () => {
    const body = within(document.body);
    await userEvent.click(body.getByRole('button', { name: 'Choisir les connecteurs' }));
    await body.findByRole('dialog', { name: 'Choisir les connecteurs à synchroniser' });
  },
};
