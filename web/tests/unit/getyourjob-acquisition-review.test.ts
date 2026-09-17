import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('GetYourJob acquisition review', () => {
  it('keeps scheduled collection disabled until an official reusable channel is authorized', () => {
    const connector = connectorRoadmap.find((entry) => entry.code === 'getyourjob');

    expect(connector).toBeDefined();
    expect(connector?.status).toBe('EMAIL_OR_EXTENSION_ONLY');
    expect(connector?.modes).toEqual(['GMAIL', 'EXTENSION']);
    expect(connector?.note).toContain('Revue du 17/09/2026');
    expect(connector?.note).toContain('catalogue de milliers d’offres IT');
    expect(connector?.note).toContain('Aucun API/RSS public');
    expect(connector?.note).toContain('visibilité publique seule');
    expect(connector?.nextStep).toContain('GetYourJob/OmDev');
    expect(connector?.nextStep).toContain('canal officiel');
  });
});
