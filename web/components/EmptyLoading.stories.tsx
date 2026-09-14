import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { ButtonLink, Card, Empty, Loading } from './UI';

const meta = {
  title: 'Feedback/EmptyAndLoading',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Baseline feedback states for JobPilot. Empty states explain what is missing and may provide a next useful action; Loading exposes one polite busy status without adding competing announcements.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyState: Story = {
  name: 'Empty state',
  render: () => (
    <Card>
      <Empty>
        <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
          <div>
            <strong>Aucune candidature à traiter</strong>
            <p style={{ marginBottom: 0 }}>
              Les candidatures prêtes apparaîtront ici après préparation.
            </p>
          </div>
          <ButtonLink href="/offres" variant="secondary" size="small">
            Voir les offres
          </ButtonLink>
        </div>
      </Empty>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');

    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveTextContent('Aucune candidature à traiter');
    await expect(canvas.getByRole('link', { name: 'Voir les offres' })).toHaveAttribute('href', '/offres');
  },
};

export const EmptyWithoutAction: Story = {
  name: 'Empty without action',
  render: () => (
    <Card>
      <Empty>Aucun résultat pour ces filtres.</Empty>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');

    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveTextContent('Aucun résultat pour ces filtres.');
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const LoadingState: Story = {
  name: 'Loading state',
  render: () => (
    <Card>
      <Loading />
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status');

    await expect(status).toHaveTextContent('Chargement…');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveAttribute('aria-busy', 'true');
  },
};

export const LongEmptyStateOnMobile: Story = {
  name: 'Long empty state on mobile',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <Card>
      <Empty>
        <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
          <div>
            <strong>Aucune candidature ne correspond encore à cette combinaison de filtres</strong>
            <p style={{ marginBottom: 0 }}>
              Modifiez les critères actifs ou revenez à la liste complète des offres pour poursuivre votre recherche sans perdre le contexte actuel.
            </p>
          </div>
          <ButtonLink href="/offres" variant="secondary" size="small">
            Revenir à toutes les offres disponibles
          </ButtonLink>
        </div>
      </Empty>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    await expect(
      canvas.getByRole('link', { name: 'Revenir à toutes les offres disponibles' }),
    ).toHaveAttribute('href', '/offres');
  },
};
