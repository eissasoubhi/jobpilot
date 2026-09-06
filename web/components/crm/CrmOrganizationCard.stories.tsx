import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { CrmOrganizationCard } from '@/components/CrmOrganizationCard';
import type { CrmOrganization } from '@/lib/types';

const meta = {
  title: 'CRM/Data-dense organization',
  component: CrmOrganizationCard,
  parameters: {
    docs: {
      description: {
        component:
          'Référence opérationnelle pour une organisation CRM : identité et activité en premier, compteurs compacts, contacts/statuts/offres organisés pour un scan rapide sans perdre les données sources.',
      },
    },
  },
} satisfies Meta<typeof CrmOrganizationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const organization = {
  key: 'fnac-darty',
  name: 'Fnac Darty',
  sourceName: 'FNAC DARTY SA',
  roles: ['COMPANY', 'CLIENT'],
  lastActivityAt: '2026-09-05T14:20:00+02:00',
  offerCount: 4,
  applicationCount: 2,
  positioningCount: 1,
  messageCount: 7,
  contactCount: 2,
  annotation: {
    displayName: 'Fnac Darty',
    note: 'Samuel est le contact principal pour les échanges autour de la mission PHP / React.',
    updatedAt: '2026-09-05T16:10:00+02:00',
  },
  contacts: [
    {
      key: 'samuel@example.com',
      name: 'Samuel',
      email: 'samuel@example.com',
      phone: null,
      roles: ['RECRUITER'],
      messageCount: 5,
      lastContactAt: '2026-09-05T14:20:00+02:00',
    },
    {
      key: 'recrutement@example.com',
      name: 'Équipe recrutement',
      email: 'recrutement@example.com',
      phone: null,
      roles: ['RECRUITER'],
      messageCount: 2,
      lastContactAt: '2026-09-02T09:30:00+02:00',
    },
  ],
  applicationStatuses: {
    SUBMITTED: 1,
    INTERVIEW: 1,
  },
  positioningStatuses: {
    MISSION_DETECTED: 1,
  },
  latestOffers: [
    {
      id: 101,
      title: 'Développeur PHP / Symfony / React',
      score: 91,
      status: 'MATCHED',
      sourceUrl: 'https://example.com/jobs/101',
    },
    {
      id: 102,
      title: 'Senior Full-stack PHP',
      score: 84,
      status: 'SUBMITTED',
      sourceUrl: null,
    },
  ],
} as unknown as CrmOrganization;

export const WithContactsAndNote: Story = {
  name: 'With contacts and note',
  args: {
    organization,
    onEditAnnotation: () => undefined,
  },
};

export const WithoutAnnotation: Story = {
  name: 'Without CRM note',
  args: {
    organization: {
      ...organization,
      name: 'Retail Marketplace',
      sourceName: 'Retail Marketplace',
      annotation: null,
      contacts: [],
      contactCount: 0,
      messageCount: 0,
    } as unknown as CrmOrganization,
    onEditAnnotation: () => undefined,
  },
};
