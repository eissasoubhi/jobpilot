import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const colors = [
  ['Canvas', 'var(--jp-color-canvas)', '--jp-color-canvas'],
  ['Surface', 'var(--jp-color-surface)', '--jp-color-surface'],
  ['Text', 'var(--jp-color-text)', '--jp-color-text'],
  ['Primary', 'var(--jp-color-primary)', '--jp-color-primary'],
  ['Primary soft', 'var(--jp-color-primary-soft)', '--jp-color-primary-soft'],
  ['Success', 'var(--jp-color-success)', '--jp-color-success'],
  ['Warning', 'var(--jp-color-warning)', '--jp-color-warning'],
  ['Danger', 'var(--jp-color-danger)', '--jp-color-danger'],
  ['AI', 'var(--jp-color-ai)', '--jp-color-ai'],
  ['AI secondary', 'var(--jp-color-ai-secondary)', '--jp-color-ai-secondary'],
] as const;

const meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => (
    <div style={{ width: 'min(980px, 100%)' }}>
      <div className="page-header">
        <div>
          <h1>Couleurs sémantiques</h1>
          <p>Utilise les tokens selon leur rôle. Les couleurs IA restent réservées aux fonctionnalités réellement assistées par IA.</p>
        </div>
      </div>
      <div className="grid cols-2">
        {colors.map(([label, color, token]) => (
          <div className="card" key={token} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 14, alignItems: 'center' }}>
            <div aria-hidden="true" style={{ width: 64, height: 64, borderRadius: 14, background: color, border: '1px solid var(--jp-color-border)' }} />
            <div>
              <strong>{label}</strong>
              <div className="small muted" style={{ marginTop: 4, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{token}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const RadiusAndElevation: Story = {
  render: () => (
    <div style={{ width: 'min(900px, 100%)' }}>
      <div className="grid cols-3">
        <div className="card" style={{ borderRadius: 'var(--jp-radius-sm)' }}>
          <strong>Petit rayon</strong>
          <p className="small muted">Filtres compacts et petits contrôles.</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--jp-radius-lg)', boxShadow: 'var(--jp-shadow-sm)' }}>
          <strong>Surface standard</strong>
          <p className="small muted">Cartes et panneaux du produit.</p>
        </div>
        <div className="card" style={{ borderRadius: 'var(--jp-radius-xl)', boxShadow: 'var(--jp-shadow-md)' }}>
          <strong>Surface élevée</strong>
          <p className="small muted">À réserver aux éléments qui doivent réellement se détacher.</p>
        </div>
      </div>
    </div>
  ),
};
