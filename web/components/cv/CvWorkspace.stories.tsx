import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import styles from '@/app/cv/cv.module.css';
import { Badge, Button, ButtonLink, Card, DataList, DataListItem, FormField } from '@/components/UI';

const meta = {
  title: 'CV/Document workspace',
  parameters: {
    docs: {
      description: {
        component:
          'Référence pour la gestion des CV : ajout secondaire, documents disponibles prioritaires, métadonnées compactes et actions explicites.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Workspace: Story = {
  render: () => (
    <div className={styles.layout}>
      <Card>
        <h2 className={styles.sectionTitle}>Ajouter un CV</h2>
        <div className="stack">
          <FormField label="Nom du CV"><input defaultValue="CV Full-Stack Symfony React" /></FormField>
          <FormField label="Langue"><select defaultValue="fr"><option value="fr">Français</option><option value="en">Anglais</option></select></FormField>
          <FormField label="Fichier PDF ou Word"><input type="file" /></FormField>
          <Button className={styles.uploadButton}>Téléverser</Button>
        </div>
      </Card>
      <Card>
        <h2 className={styles.sectionTitle}>Documents disponibles</h2>
        <DataList aria-label="CV disponibles">
          <DataListItem className={styles.documentItem}>
            <div className={styles.documentContent}>
              <h3 className={styles.documentName}>CV Full-Stack Symfony React</h3>
              <div className={`muted small ${styles.documentMeta}`}>aissa-soubhi-fullstack.pdf · 248 Ko</div>
              <div className={styles.badges}>
                <Badge tone="blue">Français</Badge><Badge tone="good">Par défaut</Badge><Badge>Symfony</Badge><Badge>React</Badge>
              </div>
            </div>
            <div className={styles.rowActions}>
              <ButtonLink href="#" variant="secondary" size="small">Télécharger</ButtonLink>
              <Button variant="danger" size="small">Supprimer</Button>
            </div>
          </DataListItem>
          <DataListItem className={styles.documentItem}>
            <div className={styles.documentContent}>
              <h3 className={styles.documentName}>CV Backend PHP</h3>
              <div className={`muted small ${styles.documentMeta}`}>cv-backend-php.docx · 184 Ko</div>
              <div className={styles.badges}><Badge tone="blue">Français</Badge><Badge>PHP</Badge><Badge>Symfony</Badge></div>
            </div>
            <div className={styles.rowActions}>
              <ButtonLink href="#" variant="secondary" size="small">Télécharger</ButtonLink>
              <Button variant="danger" size="small">Supprimer</Button>
            </div>
          </DataListItem>
        </DataList>
      </Card>
    </div>
  ),
};
