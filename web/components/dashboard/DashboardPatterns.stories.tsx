import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Card } from '@/components/UI';
import styles from '@/app/dashboard.module.css';

const meta = {
  title: 'Patterns/Dashboard Bento',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Kpis: Story = {
  render: () => (
    <div className={styles.kpiGrid} style={{ width: 'min(1100px, 100%)' }}>
      <a className={`${styles.kpiCard} ${styles.kpiEmphasis}`} href="#qualified">
        <span className={styles.kpiLabel}>Offres qualifiées</span>
        <strong>18</strong>
        <span className={styles.kpiNote}>+12 % sur les 7 derniers jours</span>
      </a>
      <a className={styles.kpiCard} href="#submitted">
        <span className={styles.kpiLabel}>Candidatures envoyées</span>
        <strong>7</strong>
        <span className={styles.kpiNote}>3 envoyées cette semaine</span>
      </a>
      <a className={styles.kpiCard} href="#responses">
        <span className={styles.kpiLabel}>Taux de réponse</span>
        <strong>28 %</strong>
        <span className={styles.kpiNote}>2 réponses sur 7 candidatures</span>
      </a>
      <a className={styles.kpiCard} href="#interviews">
        <span className={styles.kpiLabel}>Entretiens</span>
        <strong>2</strong>
        <span className={styles.kpiNote}>1 entretien à préparer</span>
      </a>
    </div>
  ),
};

export const AttentionAndPerformance: Story = {
  render: () => (
    <div className={styles.primaryGrid} style={{ width: 'min(1100px, 100%)' }}>
      <Card className={styles.attentionCard}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Priorités</span>
            <h2>À traiter maintenant</h2>
          </div>
          <a className={styles.textLink} href="#all">Tout voir</a>
        </div>
        <div className={styles.attentionList}>
          <a className={styles.attentionRow} href="#messages">
            <span className={`${styles.attentionCount} ${styles.warning}`}>2</span>
            <span className={styles.attentionCopy}>
              <strong>Messages à traiter</strong>
              <small>Deux réponses nécessitent une action.</small>
            </span>
            <span className={styles.rowAction}>Traiter</span>
          </a>
          <a className={styles.attentionRow} href="#offers">
            <span className={`${styles.attentionCount} ${styles.primary}`}>5</span>
            <span className={styles.attentionCopy}>
              <strong>Offres à revoir</strong>
              <small>Cinq offres sont prêtes pour une décision.</small>
            </span>
            <span className={styles.rowAction}>Revoir</span>
          </a>
        </div>
      </Card>

      <Card>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>Performance</span>
            <h2>Résultats de la recherche</h2>
          </div>
        </div>
        <div className={styles.performanceGrid}>
          <div><span>Taux de réponse</span><strong>28 %</strong></div>
          <div><span>Taux d’entretien</span><strong>14 %</strong></div>
          <div><span>Score moyen</span><strong>76</strong></div>
          <div><span>1re réponse médiane</span><strong>2,4 j</strong></div>
        </div>
      </Card>
    </div>
  ),
};
