import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { ButtonGroup } from './ButtonGroup';
import { Button } from './UI';

const meta = {
  title: 'Actions/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  args: {
    ariaLabel: 'Actions de la candidature',
    children: (
      <>
        <Button variant="secondary">Voir l’offre</Button>
        <Button>Préparer la candidature</Button>
      </>
    ),
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Actions de la candidature' });

    await expect(group).toBeInTheDocument();
    await expect(within(group).getByRole('button', { name: 'Voir l’offre' })).toBeEnabled();
    await expect(within(group).getByRole('button', { name: 'Préparer la candidature' })).toBeEnabled();
  },
};

export const DenseActions: Story = {
  args: {
    ariaLabel: 'Actions rapides de la candidature',
    children: (
      <>
        <Button variant="secondary">Ouvrir</Button>
        <Button variant="secondary">Relancer</Button>
        <Button>Mettre à jour</Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', {
      name: 'Actions rapides de la candidature',
    });

    await expect(within(group).getAllByRole('button')).toHaveLength(3);
  },
};

export const WithDisabledAction: Story = {
  args: {
    ariaLabel: 'Actions de soumission',
    children: (
      <>
        <Button variant="secondary">Modifier</Button>
        <Button disabled>Envoyer</Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Actions de soumission' });

    await expect(within(group).getByRole('button', { name: 'Modifier' })).toBeEnabled();
    await expect(within(group).getByRole('button', { name: 'Envoyer' })).toBeDisabled();
  },
};

export const LongLabelsAtNarrowWidth: Story = {
  args: {
    ariaLabel: 'Actions détaillées de la candidature chez Atelier Numérique Île-de-France',
    children: (
      <>
        <Button variant="secondary">Relire l’offre et les critères de compatibilité</Button>
        <Button>Préparer la candidature avant validation finale</Button>
      </>
    ),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', {
      name: 'Actions détaillées de la candidature chez Atelier Numérique Île-de-France',
    });

    await expect(within(group).getAllByRole('button')).toHaveLength(2);
  },
};
