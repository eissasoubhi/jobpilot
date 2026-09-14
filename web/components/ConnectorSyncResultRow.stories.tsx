import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ConnectorSyncResultRow } from './ConnectorSyncResultRow';

const meta = {
  title: 'Connectors/ConnectorSyncResultRow',
  component: ConnectorSyncResultRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Per-source synchronization status for JobPilot. The row keeps state explicit in text, summarizes results first, and progressively discloses diagnostics and errors.',
      },
    },
  },
  args: {
    name: 'France Travail',
    state: 'waiting',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectorSyncResultRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Synchronisation France Travail' })).toBeInTheDocument();
    await expect(canvas.getByText('En attente')).toBeInTheDocument();
  },
};

export const Running: Story = {
  args: {
    name: 'Gmail — alertes emploi',
    state: 'running',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('En cours')).toBeInTheDocument();
    await expect(canvas.getByText('Récupération, normalisation et import en cours…')).toBeInTheDocument();
  },
};

export const SuccessfulImport: Story = {
  args: {
    state: 'success',
    result: {
      received: 26,
      imported: 8,
      merged: 3,
      duplicates: 12,
      profileFiltered: 3,
      failed: 0,
      durationMs: 8450,
    },
    profileFilterReasonCounts: {
      score_below_threshold: 1,
      missing_must_have: 2,
      explicit_conflict: 1,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('8 nouvelles offres · 12 déjà connues · 3 hors profil')).toBeInTheDocument();
    await userEvent.click(canvas.getByText('Voir le détail de France Travail'));
    await expect(canvas.getByText('Durée : 8,5 s')).toBeInTheDocument();
    await expect(canvas.getByText(/2 prérequis principaux manquants/)).toBeInTheDocument();
  },
};

export const GmailWithoutExtractedOffers: Story = {
  args: {
    name: 'Gmail — propositions recruteurs',
    state: 'success',
    result: {
      received: 0,
      imported: 0,
      merged: 0,
      duplicates: 0,
      profileFiltered: 0,
      failed: 0,
      durationMs: 1720,
    },
    diagnostics: {
      messagesMatched: 7,
      messagesAlreadyKnown: 4,
      messagesImported: 3,
      offersExtracted: 0,
      messagesFailed: 0,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Voir le détail de Gmail — propositions recruteurs'));
    await expect(canvas.getByText(/7 emails trouvés, mais aucune offre exploitable/)).toBeInTheDocument();
    await expect(canvas.getByText(/Diagnostic Gmail/)).toBeInTheDocument();
  },
};

export const PartialWarning: Story = {
  args: {
    name: 'Extension navigateur — import assisté',
    state: 'warning',
    result: {
      received: 14,
      imported: 9,
      merged: 1,
      duplicates: 2,
      profileFiltered: 0,
      failed: 2,
      durationMs: 12840,
    },
    error: 'Deux fiches n’ont pas pu être normalisées complètement. Les offres valides ont été conservées et les échecs restent visibles pour diagnostic.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Avec avertissement')).toBeInTheDocument();
    await userEvent.click(canvas.getByText('Voir le détail de Extension navigateur — import assisté'));
    await expect(canvas.getByText(/Deux fiches n’ont pas pu être normalisées/)).toBeInTheDocument();
  },
};

export const LongErrorMessage: Story = {
  args: {
    name: 'Source partenaire avec un nom volontairement très long pour vérifier la pression responsive',
    state: 'error',
    result: {
      received: 0,
      imported: 0,
      merged: 0,
      duplicates: 0,
      profileFiltered: 0,
      failed: 1,
      durationMs: 60543,
    },
    error: 'La synchronisation a été interrompue après plusieurs réponses temporaires de la source. JobPilot n’a pas contourné la limitation et aucune nouvelle tentative automatique n’est lancée depuis cette vue.',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('region', {
        name: 'Synchronisation Source partenaire avec un nom volontairement très long pour vérifier la pression responsive',
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('En erreur')).toBeInTheDocument();
  },
};
