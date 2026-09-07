import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ApplicationStatusFilter } from '@/components/ApplicationStatusFilter';
import type { Application } from '@/lib/types';

function application(id: number, status: string, title: string): Application {
  return {
    id,
    status,
    channel: status === 'SUBMITTED' ? 'Gmail automatique' : 'Manuel',
    message: '',
    coverLetter: '',
    updatedAt: '2026-09-07T10:00:00Z',
    jobOffer: {
      id,
      source: 'Storybook',
      sourceCode: 'storybook',
      sourceUrl: `https://example.com/jobs/${id}`,
      title,
      company: 'Entreprise exemple',
      sources: [],
      sourceCount: 1,
      location: 'Paris',
      contractType: 'CDI',
      workMode: 'Hybride',
      language: 'fr',
      description: 'Offre de démonstration pour le suivi des candidatures.',
      score: 82,
      scoreReasons: [],
      status: 'ACTIVE',
    },
  };
}

const applications: Application[] = [
  application(1, 'READY_TO_SUBMIT', 'Développeur Full Stack'),
  application(2, 'READY_TO_SUBMIT', 'Développeur Symfony'),
  application(3, 'SUBMITTED', 'Software Engineer'),
  application(4, 'INTERVIEW', 'Développeur React'),
  application(5, 'RECRUITER_REPLIED', 'Développeur Front-end'),
  application(6, 'REJECTED', 'Développeur PHP'),
];

const meta = {
  title: 'Candidatures/Application status filter',
  component: ApplicationStatusFilter,
  parameters: {
    docs: {
      description: {
        component:
          'Filtre compact pour parcourir un pipeline de candidatures : raccourcis avec volumes, statut complet et résumé de la vue active lisible sans recalcul mental.',
      },
    },
  },
  args: {
    applications,
    onChange: () => undefined,
  },
} satisfies Meta<typeof ApplicationStatusFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllApplications: Story = {
  args: {
    value: 'ALL',
  },
};

export const ReadyToSubmit: Story = {
  args: {
    value: 'READY_TO_SUBMIT',
  },
};

export const FollowUpStatus: Story = {
  args: {
    value: 'INTERVIEW',
  },
};
