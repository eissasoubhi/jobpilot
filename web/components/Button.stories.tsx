import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

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

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Préparer la candidature' });

    await expect(button).toBeEnabled();
    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).not.toHaveAttribute('aria-busy');
  },
};

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
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Enregistrement…' });

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

export const Disabled: Story = {
  args: {
    children: 'Envoyer',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Envoyer' });

    await expect(button).toBeDisabled();
    await expect(button).not.toHaveAttribute('aria-busy');
  },
};

export const Small: Story = {
  args: {
    children: 'Relancer',
    size: 'small',
    variant: 'secondary',
  },
};

export const LongLabelAtNarrowWidth: Story = {
  args: {
    children: 'Préparer la candidature avant validation finale',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', {
        name: 'Préparer la candidature avant validation finale',
      }),
    ).toBeEnabled();
  },
};
