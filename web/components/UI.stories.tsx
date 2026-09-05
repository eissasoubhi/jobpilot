import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AiSurface, Badge, Button, Card, ErrorBox, Loading, PageHeader } from './UI';

const meta = {
  title: 'Design System/Primitives',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
  render: () => (
    <div className="actions">
      <Button>Continuer</Button>
      <Button tone="secondary">Annuler</Button>
      <Button tone="danger">Supprimer</Button>
      <Button size="small">Action rapide</Button>
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="actions">
      <Badge>Nouveau</Badge>
      <Badge tone="blue">À revoir</Badge>
      <Badge tone="good">Prêt</Badge>
      <Badge tone="warn">Attention</Badge>
      <Badge tone="bad">Bloqué</Badge>
    </div>
  ),
};

export const CardSurface: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Card>
        <h2 className="section-title">Offres qualifiées</h2>
        <p className="muted">Les offres qui correspondent le mieux à tes critères.</p>
        <div className="actions">
          <Button>Voir les offres</Button>
          <Button tone="secondary">Ajuster les critères</Button>
        </div>
      </Card>
    </div>
  ),
};

export const PageHeading: Story = {
  render: () => (
    <div style={{ width: 760 }}>
      <PageHeader
        title="Tableau de bord"
        description="Les actions prioritaires, les performances et l’état de ta recherche en un coup d’œil."
        actions={<Button>Revoir les offres</Button>}
      />
    </div>
  ),
};

export const FeedbackStates: Story = {
  render: () => (
    <div className="stack" style={{ width: 520 }}>
      <Loading label="Analyse des offres…" />
      <div className="success-box">La candidature est prête à être envoyée.</div>
      <div className="notice warning">Une information manque avant de continuer.</div>
      <ErrorBox message="Impossible de charger les offres. Réessaie dans quelques instants." />
    </div>
  ),
};

export const AiAccent: Story = {
  render: () => (
    <div style={{ width: 520 }}>
      <AiSurface className="card">
        <span className="jp-ai-label">Analyse IA</span>
        <h2 className="section-title" style={{ marginTop: 10 }}>Compatibilité avec l’offre : 84 %</h2>
        <p className="muted">Le score met en avant Symfony, React et l’expérience e-commerce. L’anglais courant reste à vérifier.</p>
        <div className="actions">
          <Button>Voir l’analyse</Button>
          <Button tone="secondary">Masquer</Button>
        </div>
      </AiSurface>
    </div>
  ),
};
