import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Card } from './UI';

const meta = {
  title: 'Layout/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Shared JobPilot surface for grouping related content. Card keeps native section semantics and forwards native section attributes so meaningful regions can be named when the content warrants it.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContentGroup: Story = {
  render: () => (
    <Card>
      <h2>Suivi de candidature</h2>
      <p>Les informations liées à une même décision restent regroupées dans une surface stable.</p>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Suivi de candidature', level: 2 })).toBeInTheDocument();
    await expect(canvas.queryByRole('region')).not.toBeInTheDocument();
  },
};

export const NamedRegion: Story = {
  render: () => (
    <Card aria-labelledby="review-card-title" data-testid="review-card">
      <h2 id="review-card-title">À vérifier avant candidature</h2>
      <p>Deux informations manquent avant de considérer cette offre comme prête.</p>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'À vérifier avant candidature' });

    await expect(region).toHaveAttribute('data-testid', 'review-card');
    await expect(region).toHaveAttribute('aria-labelledby', 'review-card-title');
  },
};

export const LongContentMobile: Story = {
  name: 'Long content · mobile',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <Card aria-labelledby="long-card-title">
      <h2 id="long-card-title">Senior Full-stack Symfony React pour une plateforme européenne de services professionnels</h2>
      <p>
        Entreprise au nom volontairement long · Paris / hybride · contexte métier détaillé conservé sans réduire la lisibilité de la surface sur écran étroit.
      </p>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('region', {
        name: 'Senior Full-stack Symfony React pour une plateforme européenne de services professionnels',
      }),
    ).toBeInTheDocument();
  },
};
