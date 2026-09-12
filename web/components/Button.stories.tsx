import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './UI';

const meta = {
  title: 'Actions/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Préparer la candidature',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Bouton partagé de JobPilot. La variante primaire reste réservée à l’action dominante du contexte ; les variantes secondaire, subtile et destructive gardent une hiérarchie plus calme.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    children: 'Voir le détail',
    variant: 'secondary',
  },
};

export const Subtle: Story = {
  args: {
    children: 'Annuler',
    variant: 'subtle',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Supprimer',
    variant: 'danger',
  },
};

export const Loading: Story = {
  args: {
    children: 'Enregistrement…',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Envoyer',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    children: 'Relancer',
    size: 'small',
    variant: 'secondary',
  },
};
