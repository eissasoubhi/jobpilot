import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OfferEditorialDetail } from '@/components/offers/OfferEditorialDetail';
import type { Job } from '@/lib/types';

const meta = {
  title: 'Offres/Editorial detail',
  component: OfferEditorialDetail,
  parameters: {
    docs: {
      description: {
        component:
          'Référence Editorial pour une offre unique : lecture longue au centre, résumé de décision séparé, explication du matching et provenance disponibles sans transformer la page en tableau de bord.',
      },
    },
  },
} satisfies Meta<typeof OfferEditorialDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseJob: Job = {
  id: 101,
  source: 'LinkedIn',
  sourceCode: 'linkedin',
  sourceUrl: 'https://example.com/jobs/101',
  title: 'Senior Full-stack Symfony / React',
  company: 'Marketplace retail',
  clientName: 'Groupe retail',
  sources: [
    {
      id: 1,
      sourceCode: 'linkedin',
      sourceName: 'LinkedIn',
      externalId: 'li-101',
      sourceUrl: 'https://example.com/jobs/101',
      matchType: 'PRIMARY',
      matchScore: 100,
      matchReasons: ['Source principale'],
      publishedAt: '2026-09-04T09:00:00+02:00',
      firstSeenAt: '2026-09-04T10:00:00+02:00',
      lastSeenAt: '2026-09-06T08:00:00+02:00',
    },
    {
      id: 2,
      sourceCode: 'wttj',
      sourceName: 'Welcome to the Jungle',
      externalId: 'wttj-404',
      sourceUrl: 'https://example.com/jobs/101-secondary',
      matchType: 'EXACT_URL',
      matchScore: 100,
      matchReasons: ['Même URL canonique'],
      publishedAt: '2026-09-04T09:00:00+02:00',
      firstSeenAt: '2026-09-05T08:30:00+02:00',
      lastSeenAt: '2026-09-06T08:10:00+02:00',
    },
  ],
  sourceCount: 2,
  applicationEmail: '',
  location: 'Paris · Hybride',
  contractType: 'Freelance',
  workMode: 'HYBRID',
  language: 'FR',
  description: 'La mission consiste à faire évoluer une plateforme e-commerce à fort trafic.\n\nVous interviendrez sur le backend Symfony, les API et le front React, avec une attention particulière portée à la qualité, aux tests et aux performances.\n\nLe contexte demande de travailler avec une équipe produit existante et de faire évoluer progressivement le legacy sans réécriture risquée.',
  publishedAt: '2026-09-04T09:00:00+02:00',
  discoveredAt: '2026-09-04T10:00:00+02:00',
  ageHours: 48,
  tjmMin: 480,
  tjmMax: 520,
  proposedTjm: 500,
  score: 92,
  scoreReasons: [
    'Symfony et React correspondent aux compétences principales du profil.',
    'La mission est située en Île-de-France avec un rythme hybride compatible.',
    'Le niveau d’expérience demandé correspond au positionnement senior.',
  ],
  status: 'MATCHED',
};

export const StrongMatch: Story = {
  name: 'Strong match',
  args: { job: baseJob },
};

export const LowMatchWithoutDescription: Story = {
  name: 'Low match / sparse data',
  args: {
    job: {
      ...baseJob,
      id: 102,
      title: 'Lead Developer Java / Angular',
      company: 'SaaS B2B',
      location: 'Lyon',
      contractType: 'CDI',
      workMode: 'ONSITE',
      description: '',
      sourceCount: 1,
      sources: [baseJob.sources[0]],
      score: 48,
      scoreReasons: ['Stack principale éloignée du profil configuré.'],
      tjmMin: undefined,
      tjmMax: undefined,
      proposedTjm: undefined,
      salaryMin: 55000,
      salaryMax: 65000,
    },
  },
};
