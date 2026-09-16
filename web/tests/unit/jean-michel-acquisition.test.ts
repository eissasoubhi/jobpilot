import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('Jean-Michel.io acquisition decision', () => {
  it('keeps Jean-Michel.io on assisted channels until reuse is explicitly authorized', () => {
    const jeanMichel = connectorRoadmap.find((entry) => entry.code === 'jean-michel');

    expect(jeanMichel).toMatchObject({
      status: 'EMAIL_OR_EXTENSION_ONLY',
      modes: ['GMAIL', 'EXTENSION'],
    });
    expect(jeanMichel?.note).toContain('16/09/2026');
    expect(jeanMichel?.note).toContain('catalogue de plusieurs milliers d’annonces sans session');
    expect(jeanMichel?.note).toContain('visibilité publique seule ne suffit pas');
    expect(jeanMichel?.nextStep).toContain('autorisation écrite Jean-Michel.io');
    expect(jeanMichel?.nextStep).toContain('canal officiel de lecture/réutilisation');
  });
});
