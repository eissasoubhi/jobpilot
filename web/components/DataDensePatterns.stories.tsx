import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge, Button, Card } from './UI';

const meta = {
  title: 'Patterns/Data Dense',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OfferList: Story = {
  render: () => (
    <div style={{ width: 'min(980px, 100%)' }}>
      <div className="tabs" aria-label="Boîte des offres">
        <button className="active" type="button">À traiter</button>
        <button type="button">Envoyées</button>
        <button type="button">Ignorées</button>
      </div>
      <Card>
        <div className="list-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="actions" style={{ marginBottom: 6 }}>
              <Badge tone="blue">À examiner</Badge>
              <Badge>Freelance</Badge>
              <Badge>Hybride</Badge>
              <Badge tone="good">TJM proposé : 500 €</Badge>
            </div>
            <h3>Senior Full-Stack Symfony / React</h3>
            <div className="muted small">Retail · Paris · publiée il y a 4 h</div>
            <div className="actions" style={{ marginTop: 10 }}>
              <Button size="small">Préparer</Button>
              <Button tone="secondary" size="small">Ouvrir l’offre</Button>
            </div>
          </div>
          <div className="score" aria-label="Score 86">86</div>
        </div>
        <div className="list-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="actions" style={{ marginBottom: 6 }}>
              <Badge tone="good">Préparée</Badge>
              <Badge>Freelance</Badge>
              <Badge>Télétravail</Badge>
            </div>
            <h3>Développeur Symfony Senior</h3>
            <div className="muted small">Média · France · publiée hier</div>
          </div>
          <div className="score" aria-label="Score 78">78</div>
        </div>
      </Card>
    </div>
  ),
};

export const CompactTable: Story = {
  render: () => (
    <div className="table-wrap" style={{ width: 'min(900px, 100%)', maxHeight: 320 }}>
      <table className="table">
        <thead>
          <tr>
            <th>Entreprise</th>
            <th>Étape</th>
            <th>Dernière action</th>
            <th>Suivi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Fnac Darty</strong><div className="small muted">Senior Full-Stack</div></td>
            <td><Badge tone="blue">Positionné</Badge></td>
            <td>Entretien préparé</td>
            <td>Aujourd’hui</td>
          </tr>
          <tr>
            <td><strong>France Télévisions</strong><div className="small muted">Symfony</div></td>
            <td><Badge tone="warn">Relance</Badge></td>
            <td>CV envoyé</td>
            <td>Demain</td>
          </tr>
          <tr>
            <td><strong>Free</strong><div className="small muted">Full-Stack</div></td>
            <td><Badge tone="good">Test envoyé</Badge></td>
            <td>Étude de cas transmise</td>
            <td>Cette semaine</td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
