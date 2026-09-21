export type TimelineLatencyReport = {
  measured: number;
  averageHours: number | null;
  medianHours: number | null;
};

export function formatTimelineLatency(hours: number | null): string {
  if (hours === null) return 'Pas encore mesuré';

  const formatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  if (hours < 24) return `${formatter.format(hours)} h`;

  return `${formatter.format(hours / 24)} j`;
}

export function timelineLatencyEvidence(report: TimelineLatencyReport): string {
  if (report.measured === 0) return 'Aucun parcours complet mesuré';

  return `${report.measured} parcours mesuré${report.measured > 1 ? 's' : ''}`;
}
