import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ConnectorDeadLettersView, type ConnectorDeadLetter } from './ConnectorDeadLettersSection';

const incidents: ConnectorDeadLetter[] = [
  {
    id: 41,
    connectorCode: 'france_travail',
    stage: 'SEARCH',
    fingerprint: 'search:france-travail:php-symfony',
    state: 'OPEN',
    failureCount: 4,
    externalId: null,
    sourceUrl: null,
    title: 'Recherche PHP / Symfony — Île-de-France',
    errorClass: 'HttpException',
    errorMessage: 'Le connecteur a reçu plusieurs réponses temporaires et la collecte a été interrompue sans contourner la limite de la source.',
    firstFailedAt: '2026-09-12T07:30:00+02:00',
    lastFailedAt: '2026-09-13T09:42:00+02:00',
  },
  {
    id: 42,
    connectorCode: 'browser_extension',
    stage: 'IMPORT',
    fingerprint: 'import:browser-extension:very-long-offer',
    state: 'OPEN',
    failureCount: 3,
    externalId: 'EXT-2026-0913-000184',
    sourceUrl: 'https://example.com/jobs/senior-full-stack-engineer',
    title: 'Senior Full-Stack Engineer Symfony / React pour une plateforme métier internationale avec un intitulé volontairement très long',
    errorClass: 'NormalizationException',
    errorMessage: 'La fiche source ne fournit pas encore toutes les informations nécessaires pour normaliser cette offre de manière fiable. Les données existantes restent conservées pour diagnostic.',
    firstFailedAt: '2026-09-13T10:15:00+02:00',
    lastFailedAt: '2026-09-13T12:18:00+02:00',
  },
];

const meta = {
  title: 'Connectors/ConnectorDeadLetters',
  component: ConnectorDeadLettersView,
  parameters: {
    layout: 'padded',
  },
  args: {
    entries: incidents,
    onResolve: () => undefined,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectorDeadLettersView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenIncidents: Story = {};

export const ResolutionInProgress: Story = {
  args: {
    busyId: 41,
  },
};

export const RecoveryError: Story = {
  args: {
    entries: [],
    error: 'Impossible de charger les incidents persistants. Réessayez lorsque le service est disponible.',
  },
};

export const ResolutionConfirmed: Story = {
  args: {
    entries: incidents.slice(1),
    message: 'Incident france_travail marqué comme résolu.',
  },
};
