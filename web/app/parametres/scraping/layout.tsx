import type { ReactNode } from 'react';

import { ButtonLink } from '../../../components/UI';
import SourcePresetPanel from './SourcePresetPanel';
import styles from './scraping.module.css';

export default function CustomScrapingSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <nav
        aria-label="Navigation des paramètres de collecte"
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}
      >
        <ButtonLink variant="secondary" href="/parametres/scraping">Sources</ButtonLink>
        <ButtonLink variant="secondary" href="/parametres/scraping/diagnostics">
          Diagnostics multi-recherche
        </ButtonLink>
      </nav>
      {children}
      <SourcePresetPanel />
    </div>
  );
}
