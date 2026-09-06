import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import styles from '@/app/parametres/settings.module.css';
import { Badge, Button, Card, DataList, DataListItem, FormField } from '@/components/UI';

const meta = {
  title: 'Paramètres/Decision-first settings',
  parameters: {
    docs: {
      description: {
        component:
          'Référence pour les paramètres : configuration principale lisible, options secondaires plus calmes, plateformes en lignes compactes et actions adaptées au mobile.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfigurationOverview: Story = {
  render: () => (
    <>
      <div className={styles.sectionGap} />
      <div className="grid cols-2">
        <Card>
          <h2 className="section-title">Préférences de candidature</h2>
          <div className="form-grid">
            <FormField label="Langue par défaut"><select defaultValue="fr"><option value="fr">Français</option><option value="en">Anglais</option></select></FormField>
            <FormField label="Mode de travail"><select defaultValue="hybrid"><option value="hybrid">Hybride</option><option value="remote">Télétravail</option></select></FormField>
          </div>
          <div className="actions" style={{ marginTop: 12 }}><Button>Enregistrer</Button></div>
        </Card>
        <Card>
          <h2 className="section-title">État des intégrations</h2>
          <p className="muted small">Les connexions restent disponibles même si une source doit être reconfigurée.</p>
          <div className="actions"><Badge tone="good">Gmail connecté</Badge><Badge tone="warn">1 action requise</Badge></div>
        </Card>
      </div>
      <Card className={styles.platformsCard}>
        <div className={styles.platformsToolbar}>
          <strong>Plateformes</strong>
          <div className={styles.platformsSummary}>Choisis où JobPilot peut préparer ou suivre tes candidatures.</div>
        </div>
        <DataList aria-label="Plateformes configurées">
          <DataListItem className={styles.platformItem}>
            <div className={styles.platformName}>LinkedIn</div>
            <div className={styles.platformCategory}><span className={styles.platformMetaLabel}>Catégorie</span>Emploi</div>
            <div className={styles.platformMode}><span className={styles.platformMetaLabel}>Mode</span>Assisté</div>
            <div className={styles.platformAction}><Button size="small" variant="secondary">Configurer</Button></div>
          </DataListItem>
          <DataListItem className={styles.platformItem}>
            <div className={styles.platformName}>Welcome to the Jungle</div>
            <div className={styles.platformCategory}><span className={styles.platformMetaLabel}>Catégorie</span>Emploi</div>
            <div className={styles.platformMode}><span className={styles.platformMetaLabel}>Mode</span>API</div>
            <div className={styles.platformAction}><Button size="small" variant="secondary">Configurer</Button></div>
          </DataListItem>
        </DataList>
      </Card>
    </>
  ),
};
