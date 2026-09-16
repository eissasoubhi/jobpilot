import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('Sept Lieues acquisition decision', () => {
  it('keeps Sept Lieues on assisted channels until reuse is explicitly authorized', () => {
    const septLieues = connectorRoadmap.find((entry) => entry.code === 'sept-lieues');

    expect(septLieues).toMatchObject({
      status: 'EMAIL_OR_EXTENSION_ONLY',
      modes: ['GMAIL', 'EXTENSION'],
    });
    expect(septLieues?.note).toContain('16/09/2026');
    expect(septLieues?.note).toContain('catalogue et des fiches d’offres accessibles sans session');
    expect(septLieues?.note).toContain('visualisation personnelle et privée');
    expect(septLieues?.nextStep).toContain('autorisation écrite Sept Lieues');
    expect(septLieues?.nextStep).toContain('canal officiel de lecture/réutilisation');
  });
});
