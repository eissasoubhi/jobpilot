import type { Application } from '@/lib/types';

export type OfferInboxView = 'actionable' | 'submitted' | 'ignored' | 'archived';

export function matchesOfferInboxView(
  application: Application | undefined,
  view: OfferInboxView,
): boolean {
  const submitted = application?.status === 'SUBMITTED';
  const ignored = application?.status === 'IGNORED_NOT_MATCH';
  const archived = application?.status === 'ARCHIVED';

  if (view === 'submitted') return submitted;
  if (view === 'ignored') return ignored;
  if (view === 'archived') return archived;

  return !submitted && !ignored && !archived;
}
