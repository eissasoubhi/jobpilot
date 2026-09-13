import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ConnectorSearchCriteriaPanel } from './ConnectorSearchCriteriaPanel';

type CriteriaFixture = {
  code: string;
  name: string;
  scope: 'GLOBAL';
  targetJobs: string[];
  skills: string[];
  effectiveQueries: string[];
  latestSearchDiagnostics?: {
    startedAt: string;
    requestedQueries: number;
    completedQueries: number;
    queriesWithResults: number;
    queriesWithoutResults: number;
    received: number;
    uniqueOffers: number;
    matchesCurrentCriteria: boolean;
    queries: Array<{
      query: string;
      statusCode: number;
      outcome: 'RESULTS' | 'NO_RESULTS' | 'ERROR';
      received: number;
      uniqueOffersAdded: number;
    }>;
  } | null;
  fixedCriteria: Array<{ key: string; label: string; value: string }>;
  limits: {
    maxItemsPerList: number;
    maxItemLength: number;
    maxEffectiveQueries: number;
  };
  note: string;
};

const baseFixture: CriteriaFixture = {
  code: 'france-travail',
  name: 'France Travail',
  scope: 'GLOBAL',
  targetJobs: [
    'Senior PHP Symfony',
    'Développeur Full-Stack Symfony React',
    'Software Engineer PHP Symfony environnement produit à forte volumétrie',
  ],
  skills: ['PHP', 'Symfony', 'React', 'TypeScript'],
  effectiveQueries: [
    'PHP Symfony',
    'Full-Stack Symfony React',
    'Software Engineer PHP Symfony environnement produit à forte volumétrie',
  ],
  latestSearchDiagnostics: {
    startedAt: '2026-09-13T18:42:00+02:00',
    requestedQueries: 3,
    completedQueries: 3,
    queriesWithResults: 1,
    queriesWithoutResults: 1,
    received: 18,
    uniqueOffers: 11,
    matchesCurrentCriteria: true,
    queries: [
      {
        query: 'PHP Symfony',
        statusCode: 200,
        outcome: 'RESULTS',
        received: 18,
        uniqueOffersAdded: 11,
      },
      {
        query: 'Full-Stack Symfony React',
        statusCode: 200,
        outcome: 'NO_RESULTS',
        received: 0,
        uniqueOffersAdded: 0,
      },
      {
        query: 'Software Engineer PHP Symfony environnement produit à forte volumétrie',
        statusCode: 503,
        outcome: 'ERROR',
        received: 0,
        uniqueOffersAdded: 0,
      },
    ],
  },
  fixedCriteria: [
    { key: 'contract', label: 'Contrat', value: 'CDI' },
    { key: 'work-mode', label: 'Mode de travail', value: 'Télétravail / hybride accepté' },
  ],
  limits: {
    maxItemsPerList: 20,
    maxItemLength: 120,
    maxEffectiveQueries: 10,
  },
  note: 'Les critères globaux sont transformés en requêtes compatibles avec France Travail avant chaque synchronisation.',
};

function mockCriteria(fixture: CriteriaFixture): void {
  globalThis.fetch = async () => new Response(JSON.stringify(fixture), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const meta = {
  title: 'Connectors/ConnectorSearchCriteriaPanel',
  component: ConnectorSearchCriteriaPanel,
  args: {
    connectorCode: 'france-travail',
  },
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Panneau de diagnostic des critères réellement utilisés par un connecteur. Les stories couvrent les résultats mixtes, l’absence d’historique, le mode lecture seule et l’entrée en édition sans déclencher de synchronisation ni de sauvegarde.',
      },
    },
  },
} satisfies Meta<typeof ConnectorSearchCriteriaPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedDiagnostics: Story = {
  render: (args) => {
    mockCriteria(baseFixture);
    return <ConnectorSearchCriteriaPanel {...args} />;
  },
  play: async () => {
    const canvas = within(document.body);
    await expect(await canvas.findByText('Performance de la dernière synchronisation')).toBeVisible();
    await expect(canvas.getByText('18 offre(s) reçue(s)')).toBeVisible();
    await expect(canvas.getByText('Aucun résultat')).toBeVisible();
    await expect(canvas.getByText('Erreur HTTP 503')).toBeVisible();
    await expect(canvas.getByText('Correspond aux critères actuels')).toBeVisible();
  },
};

export const NoPreviousDiagnostic: Story = {
  render: (args) => {
    mockCriteria({
      ...baseFixture,
      effectiveQueries: [],
      latestSearchDiagnostics: null,
    });
    return <ConnectorSearchCriteriaPanel {...args} />;
  },
  play: async () => {
    const canvas = within(document.body);
    await expect(await canvas.findByText('Aucune requête exploitable')).toBeVisible();
    await expect(canvas.getByText('Aucun diagnostic disponible. Lance un test avec le bouton ci-dessus.')).toBeVisible();
  },
};

export const ReadOnlyOverview: Story = {
  args: {
    allowGlobalEditing: false,
  },
  render: (args) => {
    mockCriteria({
      ...baseFixture,
      latestSearchDiagnostics: {
        ...baseFixture.latestSearchDiagnostics!,
        matchesCurrentCriteria: false,
      },
    });
    return <ConnectorSearchCriteriaPanel {...args} />;
  },
  play: async () => {
    const canvas = within(document.body);
    await expect(await canvas.findByText('Aperçu calculé à partir des critères globaux enregistrés dans la section précédente.')).toBeVisible();
    await expect(canvas.getByText('Critères modifiés depuis ce test')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Modifier les critères' })).not.toBeInTheDocument();
  },
};

export const EditingGlobalCriteria: Story = {
  render: (args) => {
    mockCriteria(baseFixture);
    return <ConnectorSearchCriteriaPanel {...args} />;
  },
  play: async () => {
    const canvas = within(document.body);
    const editButton = await canvas.findByRole('button', { name: 'Modifier les critères' });
    await userEvent.click(editButton);

    await expect(canvas.getByRole('textbox', { name: 'Intitulés ciblés — un par ligne' })).toHaveValue(
      baseFixture.targetJobs.join('\n'),
    );
    await expect(canvas.getByRole('textbox', { name: 'Compétences de repli — une par ligne' })).toHaveValue(
      baseFixture.skills.join('\n'),
    );
    await expect(canvas.getByRole('button', { name: 'Enregistrer les critères' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Annuler' })).toBeVisible();
  },
};
