import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('Kicklox acquisition decision', () => {
  it('keeps Kicklox on assisted channels until reuse is explicitly authorized', () => {
    const source = connectorRoadmap.find((entry) => entry.code === 'kicklox');

    expect(source).toMatchObject({
      status: 'EMAIL_OR_EXTENSION_ONLY',
      modes: ['GMAIL', 'EXTENSION'],
    });
    expect(source?.note).toContain('17/09/2026');
    expect(source?.note).toContain('accessible sans inscription');
    expect(source?.note).toContain('postuler sans inscription');
    expect(source?.note).toContain('visibilité publique seule ne suffit');
    expect(source?.nextStep).toContain('autorisation écrite Kicklox');
    expect(source?.nextStep).toContain('canal officiel de lecture/réutilisation');
  });
});