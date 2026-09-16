import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('Freelance-Informatique acquisition decision', () => {
  it('keeps Freelance-Informatique on assisted channels until reuse is explicitly authorized', () => {
    const source = connectorRoadmap.find((entry) => entry.code === 'freelance-informatique');

    expect(source).toMatchObject({
      status: 'EMAIL_OR_EXTENSION_ONLY',
      modes: ['GMAIL', 'EXTENSION'],
    });
    expect(source?.note).toContain('17/09/2026');
    expect(source?.note).toContain('consulter des offres et de postuler');
    expect(source?.note).toContain('propriété exclusive de CONSULTIME');
    expect(source?.note).toContain('visibilité publique seule ne suffit');
    expect(source?.nextStep).toContain('autorisation écrite CONSULTIME');
    expect(source?.nextStep).toContain('canal officiel de lecture/réutilisation');
  });
});
