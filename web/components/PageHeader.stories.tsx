import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button, PageHeader } from './UI';

const meta = {
  title: 'Navigation/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  args: {
    title: 'Candidatures',
    description: 'Suivez les candidatures qui demandent votre attention et gardez le prochain geste visible.',
  },
  parameters: {
    docs: {
      description: {
        component:
          'En-tête partagé de JobPilot pour installer rapidement le contexte d’une page. Le titre et la description portent la hiérarchie principale ; les actions restent limitées au geste utile du contexte.',
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPrimaryAction: Story = {
  args: {
    title: 'Offres',
    description: 'Repérez les offres à examiner puis ouvrez seulement le détail utile à votre décision.',
    actions: <Button>Synchroniser</Button>,
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'CRM recruteurs',
    description: undefined,
  },
};

export const LongContent: Story = {
  args: {
    title: 'Synchronisations et diagnostics des connecteurs',
    description:
      'Consultez l’état des sources, les résultats utiles et les erreurs récupérables sans perdre de vue la prochaine action à effectuer.',
    actions: <Button variant="secondary">Voir les connecteurs</Button>,
  },
};
