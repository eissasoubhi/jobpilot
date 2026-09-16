import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('Comet acquisition decision', () => {
  it('keeps Comet on assisted channels until an official reusable mission feed exists', () => {
    const comet = connectorRoadmap.find((entry) => entry.code === 'comet');

    expect(comet).toMatchObject({
      status: 'EMAIL_OR_EXTENSION_ONLY',
      modes: ['GMAIL', 'EXTENSION'],
    });
    expect(comet?.note).toContain('16/09/2026');
    expect(comet?.note).toContain('propositions de missions');
    expect(comet?.note).toContain('Aucun catalogue public de missions');
    expect(comet?.nextStep).toContain('canal officiel');
    expect(comet?.nextStep).toContain('autorisation écrite Comet');
  });
});
