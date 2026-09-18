import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('application submission tracking UX', () => {
  it('keeps submission tracking in the unified Offers workspace without a browser confirmation dialog', () => {
    const summarySource = readFileSync(
      resolve(process.cwd(), 'components/OfferApplicationSummary.tsx'),
      'utf8',
    );
    const legacyPageSource = readFileSync(resolve(process.cwd(), 'app/candidatures/page.tsx'), 'utf8');

    expect(summarySource).not.toContain('window.confirm');
    expect(summarySource).toContain("saveApplication('SUBMITTED'");
    expect(summarySource).toContain('J’ai envoyé la candidature');
    expect(summarySource).toContain('/review-decision/undo');
    expect(legacyPageSource).toContain("redirect('/offres')");
  });
});
