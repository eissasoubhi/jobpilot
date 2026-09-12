import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CoverLetterDrawer } from './CoverLetterDrawer';
import type { Application } from '@/lib/types';

const baseApplication = {
  id: 61,
  channel: 'Préparation locale',
  status: 'READY_TO_SUBMIT',
  message: 'Bonjour, votre offre correspond très bien à mon expérience Symfony et React. Je serais ravi d’échanger avec vous.',
  coverLetter: `Madame, Monsieur,\n\nVotre offre de Développeur Symfony correspond directement à mon expérience sur des produits web exigeants. J’ai travaillé sur des applications Symfony, React et PostgreSQL en mettant l’accent sur la qualité, la lisibilité et la fiabilité.\n\nJe serais heureux d’échanger avec vous sur vos enjeux et la façon dont je peux contribuer à l’équipe.\n\nCordialement,`,
  coverLetterManuallyEdited: false,
  coverLetterEditedAt: null,
  updatedAt: '2026-09-12T08:30:00+02:00',
  jobOffer: {
    id: 9,
    source: 'France Travail',
    title: 'Développeur Symfony / React',
    company: 'Acme Consulting',
    location: 'Paris',
    contractType: 'CDI',
    workMode: 'Hybride',
    language: 'fr',
    description: 'Développement d’un produit métier Symfony et React.',
    score: 90,
    scoreReasons: [],
    status: 'PREPARED',
    sources: [],
    sourceCount: 1,
  },
} as Application & { coverLetterManuallyEdited?: boolean; coverLetterEditedAt?: string | null };

const meta = {
  title: 'Applications/CoverLetterDrawer',
  component: CoverLetterDrawer,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    application: baseApplication,
    open: true,
    onClose: () => undefined,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CoverLetterDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GeneratedCoverLetter: Story = {};

export const ManuallyEditedCoverLetter: Story = {
  args: {
    application: {
      ...baseApplication,
      coverLetterManuallyEdited: true,
      coverLetterEditedAt: '2026-09-12T08:45:00+02:00',
      coverLetter: `${baseApplication.coverLetter}\n\nDisponibilité : immédiate.`,
    } as Application,
  },
};

export const ShortMessage: Story = {
  args: {
    initialTab: 'message',
  },
};

export const LongShortMessage: Story = {
  args: {
    initialTab: 'message',
    application: {
      ...baseApplication,
      message: 'Je souhaite vous proposer ma candidature pour ce poste. Mon expérience Symfony, React, PostgreSQL et Docker correspond aux principaux besoins présentés dans l’offre. J’ai également travaillé sur des produits à fort trafic, avec une attention particulière portée à la qualité, aux tests, à l’accessibilité et aux performances. Je serais ravi d’échanger avec vous afin de détailler mon parcours et ma disponibilité.',
    } as Application,
  },
};
