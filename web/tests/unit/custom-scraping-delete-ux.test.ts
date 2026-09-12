import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('custom scraping source deletion UX', () => {
  it('requires the shared accessible confirmation before deleting a source', () => {
    const pageSource = readFileSync(resolve(process.cwd(), 'app/parametres/scraping/page.tsx'), 'utf8');

    expect(pageSource).not.toContain('window.confirm');
    expect(pageSource).toContain("import { ConfirmDialog } from '@/components/ConfirmDialog';");
    expect(pageSource).toContain('onClick={() => setDeletingSource(source)}');
    expect(pageSource).toContain('confirmLabel="Supprimer la source"');
    expect(pageSource).toContain('if (deletingSource !== null) void deleteSource(deletingSource);');
    expect(pageSource).toContain("method: 'DELETE'");
  });

  it('names the consequence in the confirmation copy', () => {
    const pageSource = readFileSync(resolve(process.cwd(), 'app/parametres/scraping/page.tsx'), 'utf8');

    expect(pageSource).toContain('ne sera plus disponible pour les prochaines synchronisations');
  });
});
