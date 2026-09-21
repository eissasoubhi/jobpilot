import { describe, expect, it } from 'vitest';

import { formatTimelineLatency, timelineLatencyEvidence } from './timeline-latency';

describe('timeline latency presentation', () => {
  it('keeps missing evidence explicit', () => {
    expect(formatTimelineLatency(null)).toBe('Pas encore mesuré');
    expect(timelineLatencyEvidence({ measured: 0, averageHours: null, medianHours: null }))
      .toBe('Aucun parcours complet mesuré');
  });

  it('formats short durations in hours and longer durations in days', () => {
    expect(formatTimelineLatency(12.5)).toBe('12,5 h');
    expect(formatTimelineLatency(36)).toBe('1,5 j');
  });

  it('states how many timeline pairs support the metric', () => {
    expect(timelineLatencyEvidence({ measured: 1, averageHours: 2, medianHours: 2 })).toBe('1 parcours mesuré');
    expect(timelineLatencyEvidence({ measured: 4, averageHours: 6, medianHours: 4 })).toBe('4 parcours mesurés');
  });
});
