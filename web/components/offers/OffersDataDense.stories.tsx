import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import '@/app/offres/data-dense.css';

import { Badge, Button, Card, DataList, DataListItem } from '@/components/UI';

const meta = {
  title: 'Offres/Data-dense inbox',
  parameters: {
    docs: {
      description: {
        component:
          'Référence de densité pour la boîte des offres : ligne compacte, score fixe, métadonnées secondaires calmées et détails disponibles sans concurrencer la décision principale.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function OfferRow({
  title,
  company,
  location,
  score,
  status,
  tone,
  sources,
}: {
  title: string;
  company: string;
  location: string;
  score: number;
  status: string;
  tone: 'good' | 'warn' | 'bad' | 'blue' | 'neutral';
  sources: string[];
}) {
  return (
    <DataListItem>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="actions">
          <Badge tone={tone}>{status}</Badge>
          <Badge tone="blue">FR</Badge>
          <Badge>Freelance</Badge>
          <Badge tone={sources.length > 1 ? 'blue' : 'neutral'}>{sources.length} source{sources.length > 1 ? 's' : ''}</Badge>
          {sources.map((source) => <Badge key={source}>{source}</Badge>)}
        </div>
        <h3>{title}</h3>
        <div className="muted small">{company} · {location} · Il y a 2 j</div>
        <details>
          <summary>Pourquoi cette note ?</summary>
          <ul>
            <li className="small">Symfony et React correspondent au profil.</li>
            <li className="small">Mission en Île-de-France, compatible avec la mobilité.</li>
          </ul>
        </details>
        <div className="actions" style={{ marginTop: 8 }}>
          <Button size="small" variant="secondary">Ouvrir l’offre</Button>
          {status !== 'Préparée' && <Button size="small">Préparer</Button>}
        </div>
      </div>
      <div className="score" aria-label={`Score ${score}`}>{score}</div>
    </DataListItem>
  );
}

export const OperationalInbox: Story = {
  name: 'Operational inbox',
  render: () => (
    <Card>
      <DataList aria-label="Offres filtrées">
        <OfferRow
          title="Senior Symfony / React"
          company="Marketplace retail"
          location="Paris · Hybride"
          score={92}
          status="Préparée"
          tone="good"
          sources={['LinkedIn', 'Welcome to the Jungle']}
        />
        <OfferRow
          title="Développeur Full-stack PHP"
          company="Plateforme média"
          location="Remote France"
          score={84}
          status="À examiner"
          tone="blue"
          sources={['Indeed']}
        />
        <OfferRow
          title="Lead Developer PHP"
          company="SaaS B2B"
          location="Lyon"
          score={58}
          status="Exclue"
          tone="bad"
          sources={['Adzuna']}
        />
      </DataList>
    </Card>
  ),
};

export const SingleSourceCompact: Story = {
  name: 'Single source row',
  render: () => (
    <Card>
      <DataList aria-label="Offres filtrées">
        <OfferRow
          title="Software Engineer PHP / TypeScript"
          company="SaaS B2B"
          location="Remote"
          score={88}
          status="À examiner"
          tone="blue"
          sources={['LinkedIn']}
        />
      </DataList>
    </Card>
  ),
};
