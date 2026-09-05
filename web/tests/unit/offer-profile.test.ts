import { describe, expect, it } from 'vitest';

import { matchesProfileContracts } from '@/lib/offer-profile';

const profile = (acceptedContracts: string[]) => ({ acceptedContracts });
const job = (contractType: string) => ({ contractType });

describe('matchesProfileContracts', () => {
  it('keeps only contract types selected in the profile', () => {
    const preferences = profile(['Freelance', 'Portage salarial', 'Sous-traitance']);

    expect(matchesProfileContracts(job('Freelance'), preferences)).toBe(true);
    expect(matchesProfileContracts(job('Portage salarial'), preferences)).toBe(true);
    expect(matchesProfileContracts(job('Sous-traitance'), preferences)).toBe(true);
    expect(matchesProfileContracts(job('CDI'), preferences)).toBe(false);
    expect(matchesProfileContracts(job('CDD'), preferences)).toBe(false);
  });

  it('does not filter contracts when the profile has no contract preference', () => {
    expect(matchesProfileContracts(job('CDI'), profile([]))).toBe(true);
  });
});
