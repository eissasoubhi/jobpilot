import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import styles from '@/app/reporting/page.module.css';
import { Badge, Card, DataList, DataListItem, InlineFeedback } from '@/components/UI';

const meta = {
  title: 'Reporting/Bento and data-dense',
  parameters: {
    docs: {
      description: {
        component:
          'Référence de composition pour le reporting : Bento léger pour la synthèse des résultats, puis lignes data-dense pour comparer les sources sans transformer la page en dashboard décoratif.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sources = [
  { source: 'LinkedIn', total: 14, submitted: 9, interviews: 3, rejected: 2 },
  { source: 'Welcome to the Jungle', total: 8, submitted: 6, interviews: 2, rejected: 1 },
  { source: 'Indeed', total: 7, submitted: 4, interviews: 1, rejected: 2 },
];

export const ReportingOverview: Story = {
  name: 'Reporting overview',
  render: () => (
    <div className="stack">
      <div className={styles.summaryGrid}>
        <Card className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>Candidatures</h2>
          <div className={styles.badgeCluster}>
            <Badge tone="blue">29 préparées</Badge>
            <Badge tone="good">19 envoyées</Badge>
            <Badge>65,5 % envoyées</Badge>
          </div>
        </Card>
        <Card className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>Résultats connus</h2>
          <div className={styles.badgeCluster}>
            <Badge tone="good">6 entretiens</Badge>
            <Badge tone="bad">5 refus</Badge>
            <Badge>24 non refusées</Badge>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="section-title">Conversion par source</h2>
        <DataList aria-label="Conversion des candidatures par source" className={styles.sourceList}>
          {sources.map((row) => (
            <DataListItem key={row.source}>
              <div className={styles.sourceRow}>
                <strong className={styles.sourceName}>{row.source}</strong>
                <div className={styles.badgeCluster}>
                  <Badge>{row.total} candidatures</Badge>
                  <Badge tone="good">{row.submitted} envoyées</Badge>
                  <Badge tone="blue">{row.interviews} entretiens</Badge>
                  <Badge tone="bad">{row.rejected} refus</Badge>
                </div>
              </div>
            </DataListItem>
          ))}
        </DataList>
      </Card>

      <InlineFeedback tone="warning">
        Les taux reposent uniquement sur les statuts enregistrés dans JobPilot.
      </InlineFeedback>
    </div>
  ),
};

export const SparseData: Story = {
  name: 'Sparse data',
  render: () => (
    <div className="stack">
      <div className={styles.summaryGrid}>
        <Card className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>Candidatures</h2>
          <div className={styles.badgeCluster}>
            <Badge tone="blue">3 préparées</Badge>
            <Badge tone="good">1 envoyée</Badge>
            <Badge>33,3 % envoyées</Badge>
          </div>
        </Card>
        <Card className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>Résultats connus</h2>
          <div className={styles.badgeCluster}>
            <Badge tone="good">0 entretien</Badge>
            <Badge tone="bad">0 refus</Badge>
            <Badge>3 non refusées</Badge>
          </div>
        </Card>
      </div>
    </div>
  ),
};
