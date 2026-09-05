import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import styles from '@/app/offres/review/review.module.css';

const meta = {
  title: 'Patterns/Review Decision Bar',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function DecisionBar({ saving = false, error = false }: { saving?: boolean; error?: boolean }) {
  return (
    <div style={{ minHeight: 220, padding: 32, background: 'var(--jp-color-canvas)' }}>
      <p className="muted">La barre reste accessible pendant la lecture de l’offre et garde les deux décisions principales symétriques.</p>
      <nav className={styles.decisionBar} aria-label="Décision et navigation dans la revue des offres">
        <button className={`${styles.decisionButton} ${styles.rejectButton}`} type="button" disabled={saving}>
          <span aria-hidden="true">✕</span>
          <span>{saving ? 'Enregistrement…' : 'Ne correspond pas'}</span>
        </button>

        <div className={styles.secondaryNavigation}>
          <button className={styles.navButton} type="button" aria-label="Offre précédente">← <span>Préc.</span></button>
          <div className={styles.progressBlock}>
            <div className={styles.progressLabel}><strong>3 / 8</strong><span>← →</span></div>
            <div className={styles.progressTrack} aria-hidden="true"><span style={{ width: '37.5%' }} /></div>
          </div>
          <button className={styles.navButton} type="button" aria-label="Offre suivante"><span>Suiv.</span> →</button>
        </div>

        <button className={`${styles.decisionButton} ${styles.sentButton}`} type="button" disabled={saving}>
          <span aria-hidden="true">✓</span>
          <span>{saving ? 'Enregistrement…' : 'Envoyée'}</span>
        </button>

        {error && <div className={styles.decisionError} role="alert">La décision n’a pas pu être enregistrée. Réessaie.</div>}
      </nav>
    </div>
  );
}

export const Default: Story = {
  render: () => <DecisionBar />,
};

export const Saving: Story = {
  render: () => <DecisionBar saving />,
};

export const ErrorState: Story = {
  render: () => <DecisionBar error />,
};
