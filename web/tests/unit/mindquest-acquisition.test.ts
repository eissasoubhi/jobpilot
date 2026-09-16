import { describe, expect, it } from 'vitest';

import { connectorRoadmap } from '../../lib/connector-roadmap';

describe('Mindquest acquisition decision', () => {
  it('keeps Mindquest on assisted channels until reuse is explicitly authorized', () => {
    const mindquest = connectorRoadmap.find((entry) => entry.code === 'mindquest');

    expect(mindquest).toMatchObject({
      status: 'EMAIL_OR_EXTENSION_ONLY',
      modes: ['GMAIL', 'EXTENSION'],
    });
    expect(mindquest?.note).toContain('16/09/2026');
    expect(mindquest?.note).toContain('listes et fiches de missions accessibles sans session');
    expect(mindquest?.note).toContain('interdisent de copier, reproduire ou dupliquer');
    expect(mindquest?.nextStep).toContain('autorisation écrite Mindquest');
    expect(mindquest?.nextStep).toContain('canal officiel de lecture/réutilisation');
  });
});
