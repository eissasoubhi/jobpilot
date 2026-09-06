import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import styles from '@/app/dashboard.module.css';
import { Badge, Card } from '@/components/UI';

const meta = {
  title: 'Dashboard/Bento composition',
  parameters: {
    docs: {
      description: {
        component:
          'Executable reference for the JobPilot dashboard composition. Bento weights decision-critical modules without turning operational lists into decorative cards. It reuses the production dashboard CSS and shared design tokens.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function KpiPreview({
  label,
  value,
  note,
  emphasis = false,
}: {
  label: string;
  value: string;
  note: string;
  emphasis?: boolean;
}) {
  return (
    <a
      className={`${styles.kpiCard} ${emphasis ? styles.kpiEmphasis : ''}`}
      href="#dashboard-bento"
      onClick={(event) => event.preventDefault()}
    >
      <span className={styles.kpiLabel}>{label}</span>
      <strong>{value}</strong>
      <span className={styles.kpiNote}>{note}</span>
    </a>
  );
}

export const DecisionOverview: Story = {
  name: 'Decision overview',
  render: () => (
    <div className={styles.dashboard} id="dashboard-bento">
      <section className={styles.kpiGrid} aria-label="Indicateurs principaux">
        <KpiPreview label="Nouvelles offres" value="18" note="+12 % vs 7 j précédents" />
        <KpiPreview label="À revoir" value="6" note="candidatures prêtes à décider" emphasis />
        <KpiPreview label="Envoyées" value="4" note="stable vs 7 j précédents" />
        <KpiPreview label="Taux de réponse" value="21 %" note="5 réponses enregistrées" />
      </section>

      <section className={styles.primaryGrid} aria-label="Priorités et activité">
        <Card className={styles.attentionCard}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Focus du jour</span>
              <h2>À faire maintenant</h2>
            </div>
            <Badge tone="warn">8 actions</Badge>
          </div>

          <p className={styles.contextNote}>
            Priorité recommandée : <strong>Messages à traiter</strong>. Les réponses et relances passent avant la revue des nouvelles candidatures.
          </p>

          <div className={styles.attentionList}>
            <a className={styles.attentionRow} href="#dashboard-bento" onClick={(event) => event.preventDefault()}>
              <span className={`${styles.attentionCount} ${styles.warning}`}>2</span>
              <span className={styles.attentionCopy}>
                <strong>Messages à traiter</strong>
                <small>Réponses détectées qui nécessitent une action.</small>
              </span>
              <span className={styles.rowAction}>Traiter les messages →</span>
            </a>
            <a className={styles.attentionRow} href="#dashboard-bento" onClick={(event) => event.preventDefault()}>
              <span className={`${styles.attentionCount} ${styles.primary}`}>6</span>
              <span className={styles.attentionCopy}>
                <strong>Offres à revoir</strong>
                <small>Des candidatures sont prêtes à être décidées.</small>
              </span>
              <span className={styles.rowAction}>Revoir les offres →</span>
            </a>
          </div>
        </Card>

        <Card className={styles.activityCard}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>7 jours</span>
              <h2>Activité récente</h2>
            </div>
          </div>
          <div className={styles.performanceGrid}>
            <div><span>Offres détectées</span><strong>43</strong></div>
            <div><span>Candidatures envoyées</span><strong>9</strong></div>
            <div><span>Réponses</span><strong>5</strong></div>
            <div><span>Entretiens</span><strong>2</strong></div>
          </div>
          <p className={styles.contextNote}>
            Le module secondaire reste plus compact que la zone de décision principale.
          </p>
        </Card>
      </section>

      <section className={styles.analyticsGrid} aria-label="Conversion et performance">
        <Card>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Conversion</span>
              <h2>Parcours global</h2>
            </div>
          </div>
          <div className={styles.pipeline}>
            {[
              ['Offres qualifiées', 68, '100%'],
              ['Candidatures préparées', 24, '35%'],
              ['Envoyées', 16, '24%'],
              ['Entretiens', 4, '6%'],
            ].map(([label, value, width]) => (
              <div className={styles.pipelineRow} key={label}>
                <div className={styles.pipelineMeta}><span>{label}</span><strong>{value}</strong></div>
                <div className={styles.pipelineTrack}><span style={{ width }} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Qualité</span>
              <h2>Performance</h2>
            </div>
          </div>
          <div className={styles.performanceGrid}>
            <div><span>Taux de réponse</span><strong>21 %</strong></div>
            <div><span>Conversion entretien</span><strong>8 %</strong></div>
            <div><span>Délai médian</span><strong>2,4 j</strong></div>
            <div><span>Score moyen</span><strong>82</strong></div>
          </div>
        </Card>
      </section>
    </div>
  ),
};

export const ClearState: Story = {
  name: 'No urgent action',
  render: () => (
    <div className={styles.dashboard}>
      <section className={styles.primaryGrid}>
        <Card className={styles.attentionCard}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Focus du jour</span>
              <h2>À faire maintenant</h2>
            </div>
            <Badge tone="good">À jour</Badge>
          </div>
          <div className={styles.clearState}>
            <strong>Rien d’urgent.</strong>
            <span>Les offres à revoir, les messages, les relances et les sources ne demandent aucune action.</span>
          </div>
        </Card>
      </section>
    </div>
  ),
};
