import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('Cherry Pick acquisition decision', () => {
  it('keeps Cherry Pick on assisted channels until an official reusable mission feed exists', () => {
    const cherryPick = connectorRoadmap.find((entry) => entry.code === 'cherry-pick');

    expect(cherryPick).toMatchObject({
      status: 'EMAIL_OR_EXTENSION_ONLY',
      modes: ['GMAIL', 'EXTENSION'],
    });
    expect(cherryPick?.note).toContain('16/09/2026');
    expect(cherryPick?.note).toContain('Aucun catalogue public actuel de missions');
    expect(cherryPick?.note).toContain('aucune session privée n’est automatisée');
    expect(cherryPick?.nextStep).toContain('canal officiel de lecture des missions');
    expect(cherryPick?.nextStep).toContain('autorisation écrite Cherry Pick');
  });
});
