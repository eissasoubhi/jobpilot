import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Button, FloatingPanel } from './UI';

const meta = {
  title: 'Design System/Feedback/FloatingPanel',
  component: FloatingPanel,
  tags: ['autodocs'],
  args: {
    children: null,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Shared floating surface for compact contextual controls. Use an explicit landmark role and accessible name when the panel represents a meaningful region; keep content focused and avoid turning it into a second full page.',
      },
    },
  },
} satisfies Meta<typeof FloatingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ContextualControls: Story = {
  render: () => (
    <div style={{ minHeight: 240, padding: 24, background: 'var(--surface-subtle, transparent)' }}>
      <FloatingPanel
        role="region"
        ariaLabel="Synchronisation ciblée"
        style={{ width: 'min(100%, 420px)' }}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <strong>Synchronisation ciblée</strong>
            <p className="muted" style={{ margin: '0.35rem 0 0' }}>
              Lance uniquement les connecteurs sélectionnés sans modifier leur état global.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Button size="small">Lancer</Button>
            <Button size="small" variant="subtle">Fermer</Button>
          </div>
        </div>
      </FloatingPanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole('region', { name: 'Synchronisation ciblée' });

    await expect(panel).toBeInTheDocument();
    await expect(within(panel).getByRole('button', { name: 'Lancer' })).toBeEnabled();
    await expect(within(panel).getByRole('button', { name: 'Fermer' })).toBeEnabled();
  },
};

export const CompactDiagnostic: Story = {
  render: () => (
    <div style={{ minHeight: 200, padding: 24 }}>
      <FloatingPanel
        role="region"
        ariaLabel="Détail de synchronisation"
        style={{ width: 'min(100%, 360px)' }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <strong>Détail de synchronisation</strong>
          <span>2 nouvelles offres · 8 déjà connues</span>
          <Button size="small" variant="secondary">Voir le détail</Button>
        </div>
      </FloatingPanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole('region', { name: 'Détail de synchronisation' });

    await expect(within(panel).getByText('2 nouvelles offres · 8 déjà connues')).toBeInTheDocument();
    await expect(within(panel).getByRole('button', { name: 'Voir le détail' })).toBeEnabled();
  },
};

export const LongContentOnNarrowViewport: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div style={{ minHeight: 320, padding: 16 }}>
      <FloatingPanel
        role="region"
        ariaLabel="Diagnostic du connecteur France Travail"
        style={{ width: 'min(100%, 420px)' }}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <strong>Diagnostic du connecteur France Travail</strong>
          <p className="muted" style={{ margin: 0 }}>
            La dernière synchronisation contient plusieurs résultats déjà connus et un détail technique plus long qui doit rester lisible sans masquer l’action utile.
          </p>
          <Button size="small" variant="secondary">Voir le diagnostic complet</Button>
        </div>
      </FloatingPanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole('region', { name: 'Diagnostic du connecteur France Travail' });

    await expect(panel).toBeInTheDocument();
    await expect(
      within(panel).getByRole('button', { name: 'Voir le diagnostic complet' }),
    ).toBeEnabled();
  },
};
