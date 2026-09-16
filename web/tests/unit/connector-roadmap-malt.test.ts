import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('Malt acquisition decision', () => {
  it('keeps Malt on assisted channels after the source review', () => {
    const connector = connectorRoadmap.find((entry) => entry.code === 'malt');

    expect(connector).toBeDefined();
    expect(connector?.status).toBe('EMAIL_OR_EXTENSION_ONLY');
    expect(connector?.modes).toEqual(['GMAIL', 'EXTENSION']);
    expect(connector?.note).toContain('16/09/2026');
    expect(connector?.note).toContain('aucun catalogue public de missions');
    expect(connector?.note).toContain('propositions de missions');
    expect(connector?.nextStep).toContain('canal officiel');
  });
});
