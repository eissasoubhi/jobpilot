'use client';

import { useEffect, useMemo, useState } from 'react';

import { Skeleton, SkeletonGroup } from '@/components/Skeleton';
import { Badge, Card, DataList, DataListItem, Empty, ErrorBox, InlineFeedback, PageHeader } from '@/components/UI';
import { api } from '@/lib/api';
import { buildApplicationReporting } from '@/lib/application-reporting';
import { getErrorMessage } from '@/lib/errors';
import { formatTimelineLatency, timelineLatencyEvidence, type TimelineLatencyReport } from '@/lib/timeline-latency';
import type { Application } from '@/lib/types';

import styles from './page.module.css';

function rate(value: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value)} %`;
}

function ReportingSkeleton() {
  return (
    <SkeletonGroup label="Chargement des indicateurs de candidature">
      <div className={styles.summaryGrid}>
        <Card className={styles.summaryCard}>
          <div className={styles.skeletonTitle}><Skeleton width="42%" height={22} /></div>
          <div className={styles.badgeCluster}>
            <Skeleton width={92} height={24} />
            <Skeleton width={104} height={24} />
            <Skeleton width={82} height={24} />
          </div>
        </Card>
        <Card className={styles.summaryCard}>
          <div className={styles.skeletonTitle}><Skeleton width="48%" height={22} /></div>
          <div className={styles.badgeCluster}>
            <Skeleton width={96} height={24} />
            <Skeleton width={76} height={24} />
            <Skeleton width={110} height={24} />
          </div>
        </Card>
      </div>

      <Card>
        <Skeleton width="34%" height={24} />
        <DataList aria-hidden="true" className={styles.sourceList}>
          {[0, 1, 2].map((index) => (
            <DataListItem key={index}>
              <div className={styles.sourceRow}>
                <Skeleton width="28%" height={18} />
                <div className={styles.badgeCluster}>
                  <Skeleton width={96} height={24} />
                  <Skeleton width={92} height={24} />
                  <Skeleton width={88} height={24} />
                </div>
              </div>
            </DataListItem>
          ))}
        </DataList>
      </Card>
    </SkeletonGroup>
  );
}

export default function ReportingPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [responseLatency, setResponseLatency] = useState<TimelineLatencyReport | null>(null);
  const [applicationLatency, setApplicationLatency] = useState<TimelineLatencyReport | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.all([
      api<Application[]>('/applications'),
      api<TimelineLatencyReport>('/reporting/response-latency'),
      api<TimelineLatencyReport>('/reporting/application-latency'),
    ])
      .then(([items, responseResult, applicationResult]) => {
        if (!active) return;
        setApplications(items);
        setResponseLatency(responseResult);
        setApplicationLatency(applicationResult);
        setError('');
      })
      .catch((caughtError: unknown) => {
        if (active) setError(getErrorMessage(caughtError));
      });
    return () => { active = false; };
  }, []);

  const summary = useMemo(
    () => applications ? buildApplicationReporting(applications) : null,
    [applications],
  );

  return (
    <>
      <PageHeader
        title="Reporting candidatures"
        description="Indicateurs locaux calculés uniquement depuis les candidatures et événements métier déjà enregistrés dans JobPilot."
      />
      {error !== '' ? (
        <Card>
          <ErrorBox message={error} />
        </Card>
      ) : summary === null || responseLatency === null || applicationLatency === null ? (
        <ReportingSkeleton />
      ) : summary.total === 0 ? (
        <Card><Empty>Aucune candidature n’est disponible pour calculer les indicateurs.</Empty></Card>
      ) : (
        <div className="stack">
          <div className={styles.summaryGrid}>
            <Card className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Candidatures</h2>
              <div className={styles.badgeCluster}>
                <Badge tone="blue">{summary.total} préparée(s)</Badge>
                <Badge tone="good">{summary.submitted} envoyée(s)</Badge>
                <Badge>{rate(summary.submissionRate)} envoyées</Badge>
              </div>
            </Card>
            <Card className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Résultats connus</h2>
              <div className={styles.badgeCluster}>
                <Badge tone="good">{summary.interviews} entretien(s)</Badge>
                <Badge tone="bad">{summary.rejected} refus</Badge>
                <Badge>{summary.active} non refusée(s)</Badge>
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="section-title">Délais issus de la timeline</h2>
            <DataList aria-label="Délais calculés depuis les événements métier">
              <DataListItem>
                <div className={styles.sourceRow}>
                  <div>
                    <strong className={styles.sourceName}>Découverte → candidature</strong>
                    <div>{timelineLatencyEvidence(applicationLatency)}</div>
                  </div>
                  <div className={styles.badgeCluster}>
                    <Badge tone="blue">Moyenne {formatTimelineLatency(applicationLatency.averageHours)}</Badge>
                    <Badge>Médiane {formatTimelineLatency(applicationLatency.medianHours)}</Badge>
                  </div>
                </div>
              </DataListItem>
              <DataListItem>
                <div className={styles.sourceRow}>
                  <div>
                    <strong className={styles.sourceName}>Candidature → première réponse</strong>
                    <div>{timelineLatencyEvidence(responseLatency)}</div>
                  </div>
                  <div className={styles.badgeCluster}>
                    <Badge tone="blue">Moyenne {formatTimelineLatency(responseLatency.averageHours)}</Badge>
                    <Badge>Médiane {formatTimelineLatency(responseLatency.medianHours)}</Badge>
                  </div>
                </div>
              </DataListItem>
            </DataList>
          </Card>

          <Card>
            <h2 className="section-title">Conversion par source</h2>
            <DataList aria-label="Conversion des candidatures par source">
              {summary.bySource.map((row) => (
                <DataListItem key={row.source}>
                  <div className={styles.sourceRow}>
                    <strong className={styles.sourceName}>{row.source}</strong>
                    <div className={styles.badgeCluster}>
                      <Badge>{row.total} candidature(s)</Badge>
                      <Badge tone="good">{row.submitted} envoyée(s)</Badge>
                      <Badge tone="blue">{row.interviews} entretien(s)</Badge>
                      <Badge tone="bad">{row.rejected} refus</Badge>
                    </div>
                  </div>
                </DataListItem>
              ))}
            </DataList>
          </Card>

          <InlineFeedback tone="warning">
            Les conversions reposent sur les statuts enregistrés. Les délais utilisent uniquement la timeline métier horodatée : JobPilot n’invente aucune réponse, candidature ou date manquante.
          </InlineFeedback>
        </div>
      )}
    </>
  );
}
