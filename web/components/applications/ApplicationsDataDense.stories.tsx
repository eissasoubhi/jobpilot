import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import styles from '@/app/candidatures/page.module.css';
import { Badge, Button, Card, DataList, DataListItem, DataToolbar } from '@/components/UI';

const meta = {
  title: 'Candidatures/Data-dense list',
  parameters: {
    docs: {
      description: {
        component:
          'Référence de densité pour le suivi des candidatures : informations essentielles scannables, statut visible une seule fois, métadonnées secondaires plus calmes et action stable à droite.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type PreviewApplication = {
  title: string;
  company: string;
  location: string;
  contract: string;
  status: string;
  tone: 'good' | 'warn' | 'bad' | 'blue' | 'neutral';
  score: number;
  language: string;
  extra?: string;
  error?: string;
};

const applications: PreviewApplication[] = [
  {
    title: 'Senior Symfony / React',
    company: 'Marketplace retail',
    location: 'Paris · Hybride',
    contract: 'Freelance',
    status: 'Prête à envoyer',
    tone: 'good',
    score: 92,
    language: 'FR',
    extra: 'TJM 500 €',
  },
  {
    title: 'Développeur Full-stack PHP',
    company: 'Plateforme média',
    location: 'Remote France',
    contract: 'Freelance',
    status: 'À vérifier',
    tone: 'warn',
    score: 78,
    language: 'FR',
  },
  {
    title: 'Software Engineer PHP / TypeScript',
    company: 'SaaS B2B',
    location: 'Lyon · Hybride',
    contract: 'CDI',
    status: 'Échec de l’envoi',
    tone: 'bad',
    score: 84,
    language: 'EN',
    error: 'Le canal automatique n’a pas confirmé l’envoi. Le suivi reste inchangé.',
  },
];

function ApplicationsPreview({ items = applications }: { items?: PreviewApplication[] }) {
  return (
    <Card>
      <DataToolbar actions={<Button size="small" variant="secondary">Filtrer</Button>}>
        <div>
          <strong>{items.length} candidatures</strong>
          <div className="small muted">Priorité au statut, au score et à l’action suivante.</div>
        </div>
      </DataToolbar>
      <DataList aria-label="Aperçu des candidatures">
        {items.map((application) => (
          <DataListItem key={application.title}>
            <div className={styles.applicationMain}>
              <h3 className={styles.applicationTitle}>{application.title}</h3>
              <div className={`small ${styles.applicationMeta}`}>
                {application.company} · {application.location} · {application.contract}
              </div>
              <div className={styles.metaBadges}>
                <Badge tone={application.tone}>{application.status}</Badge>
                <Badge tone="blue">Score {application.score}</Badge>
                <Badge>{application.language}</Badge>
                {application.extra && <Badge tone="good">{application.extra}</Badge>}
              </div>
              {application.error && (
                <div className={`small ${styles.submissionError}`}>
                  <strong>Action requise :</strong> {application.error}
                </div>
              )}
            </div>
            <div className={styles.listAction}>
              <Button size="small" variant="secondary">Examiner</Button>
            </div>
          </DataListItem>
        ))}
      </DataList>
    </Card>
  );
}

export const OperationalList: Story = {
  name: 'Operational list',
  render: () => <ApplicationsPreview />,
};

export const WithSubmissionFailure: Story = {
  name: 'With action error',
  render: () => <ApplicationsPreview items={[applications[2]]} />,
};
