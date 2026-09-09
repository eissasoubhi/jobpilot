import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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

export const Default: Story = {};

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
};
