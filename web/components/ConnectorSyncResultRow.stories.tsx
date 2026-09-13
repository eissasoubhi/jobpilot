import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ConnectorSyncResultRow } from './ConnectorSyncResultRow';

const meta = {
  title: 'Connectors/ConnectorSyncResultRow',
  component: ConnectorSyncResultRow,
  parameters: {
    layout: 'padded',
  },
  args: {
    name: 'France Travail',
    state: 'waiting',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectorSyncResultRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = {};

export const Running: Story = {
  args: {
    name: 'Gmail — alertes emploi',
    state: 'running',
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
};
