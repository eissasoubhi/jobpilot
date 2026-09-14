import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { level: 1, name: 'Candidatures' })).toBeInTheDocument();
    await expect(
      canvas.getByText('Suivez les candidatures qui demandent votre attention et gardez le prochain geste visible.'),
    ).toBeInTheDocument();
  },
};

export const WithPrimaryAction: Story = {
  args: {
    title: 'Offres',
    description: 'Repérez les offres à examiner puis ouvrez seulement le détail utile à votre décision.',
    actions: <Button>Synchroniser</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { level: 1, name: 'Offres' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Synchroniser' })).toBeEnabled();
  },
};

export const WithoutDescription: Story = {
  args: {
    title: 'CRM recruteurs',
    description: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { level: 1, name: 'CRM recruteurs' })).toBeInTheDocument();
    await expect(canvas.queryByRole('paragraph')).not.toBeInTheDocument();
  },
};

export const LongContent: Story = {
  args: {
    title: 'Synchronisations et diagnostics des connecteurs',
    description:
      'Consultez l’état des sources, les résultats utiles et les erreurs récupérables sans perdre de vue la prochaine action à effectuer.',
    actions: <Button variant="secondary">Voir les connecteurs</Button>,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Synchronisations et diagnostics des connecteurs' }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Voir les connecteurs' })).toBeEnabled();
  },
};
