import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('FreelanceRepublik acquisition decision', () => {
  it('keeps scheduled scraping disabled and preserves user-authorized channels', () => {
    const connector = connectorRoadmap.find((entry) => entry.code === 'freelance-republik');

    expect(connector).toBeDefined();
    expect(connector?.status).toBe('EMAIL_OR_EXTENSION_ONLY');
    expect(connector?.modes).toEqual(['GMAIL', 'EXTENSION']);
    expect(connector?.note).toContain('16/09/2026');
    expect(connector?.note).toContain('publiquement visibles');
    expect(connector?.note).toContain('robots');
    expect(connector?.note).toContain('outils de collecte de données');
    expect(connector?.nextStep).toContain('autorisation écrite FreelanceRepublik');
  });
});
