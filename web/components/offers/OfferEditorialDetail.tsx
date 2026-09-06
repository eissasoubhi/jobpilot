import { Badge, ButtonLink, Card, PageHeader } from '@/components/UI';
import { jobDescriptionToPlainText } from '@/lib/job-description';
import type { Job } from '@/lib/types';

import styles from './OfferEditorialDetail.module.css';

function formatDate(value?: string | null): string {
  if (!value) return 'Non renseignée';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Non renseignée';

  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(date);
}

function workModeLabel(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'REMOTE') return 'Télétravail';
  if (normalized === 'HYBRID') return 'Hybride';
  if (normalized === 'ONSITE' || normalized === 'ON_SITE') return 'Sur site';
  return value || 'Mode non renseigné';
}

function compensationLabel(job: Job): string {
  if (typeof job.tjmFixed === 'number') return `${job.tjmFixed} € / jour`;
  if (typeof job.tjmMin === 'number' || typeof job.tjmMax === 'number') {
    const min = typeof job.tjmMin === 'number' ? `${job.tjmMin} €` : '—';
    const max = typeof job.tjmMax === 'number' ? `${job.tjmMax} €` : '—';
    return `${min} – ${max} / jour`;
  }
  if (typeof job.salaryMin === 'number' || typeof job.salaryMax === 'number') {
    const min = typeof job.salaryMin === 'number' ? `${new Intl.NumberFormat('fr-FR').format(job.salaryMin)} €` : '—';
    const max = typeof job.salaryMax === 'number' ? `${new Intl.NumberFormat('fr-FR').format(job.salaryMax)} €` : '—';
    return `${min} – ${max} / an`;
  }
  if (typeof job.proposedTjm === 'number') return `Proposition JobPilot : ${job.proposedTjm} € / jour`;
  if (typeof job.proposedSalary === 'number') {
    return `Proposition JobPilot : ${new Intl.NumberFormat('fr-FR').format(job.proposedSalary)} € / an`;
  }
  return 'Non renseignée';
}

function scoreTone(score: number): 'good' | 'blue' | 'warn' {
  if (score >= 80) return 'good';
  if (score >= 60) return 'blue';
  return 'warn';
}

export function OfferEditorialDetail({ job }: { job: Job }) {
  const description = jobDescriptionToPlainText(job.description).trim();
  const sourceUrl = job.sourceUrl || job.sources?.find((source) => source.sourceUrl)?.sourceUrl || null;
  const company = job.company || job.clientName || 'Entreprise non renseignée';

  return (
    <div className={styles.page}>
      <PageHeader
        title={job.title}
        description={`${company} · ${job.location || 'Lieu non renseigné'}`}
        actions={<ButtonLink href="/offres" variant="secondary">Retour aux offres</ButtonLink>}
      />

      <div className={styles.headerMeta} aria-label="Informations essentielles">
        <Badge tone={scoreTone(job.score)}>Score {job.score}/100</Badge>
        <Badge>{job.contractType || 'Contrat non renseigné'}</Badge>
        <Badge>{workModeLabel(job.workMode)}</Badge>
        <Badge>{job.language || 'Langue non renseignée'}</Badge>
        {job.sourceCount > 1 && <Badge tone="blue">{job.sourceCount} sources</Badge>}
      </div>

      <div className={styles.layout}>
        <main className={styles.main}>
          <Card>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Mission</span>
              <h2>Description de l’offre</h2>
            </div>
            {description !== '' ? (
              <p className={styles.description}>{description}</p>
            ) : (
              <div className={styles.emptyDetail}>La description complète n’est pas disponible.</div>
            )}
          </Card>

          <Card>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Matching JobPilot</span>
              <h2>Pourquoi cette note ?</h2>
            </div>
            {job.scoreReasons.length > 0 ? (
              <ul className={styles.reasonList}>
                {job.scoreReasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            ) : (
              <div className={styles.emptyDetail}>Aucune explication détaillée disponible.</div>
            )}
          </Card>

          <Card>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>Provenance</span>
              <h2>Sources de l’offre</h2>
            </div>
            {job.sources.length > 0 ? (
              <div className={styles.sourceList}>
                {job.sources.map((source, index) => (
                  <div className={styles.sourceRow} key={`${source.id ?? source.sourceCode}-${index}`}>
                    <div className={styles.sourceIdentity}>
                      <strong>{source.sourceName || source.sourceCode}</strong>
                      <span>
                        Vue le {formatDate(source.firstSeenAt)} · dernière détection {formatDate(source.lastSeenAt)}
                      </span>
                    </div>
                    {source.sourceUrl && (
                      <ButtonLink href={source.sourceUrl} target="_blank" rel="noreferrer" variant="secondary" size="small">
                        Voir la source
                      </ButtonLink>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyDetail}>Aucune provenance détaillée disponible.</div>
            )}
          </Card>
        </main>

        <aside className={styles.aside} aria-label="Résumé de décision">
          <Card>
            <div className={styles.scoreBlock}>
              <div className={styles.scoreLine}>
                <strong>{job.score}</strong>
                <span>/ 100</span>
              </div>
              <Badge tone={scoreTone(job.score)}>
                {job.score >= 80 ? 'Très bonne correspondance' : job.score >= 60 ? 'À examiner' : 'Correspondance faible'}
              </Badge>
            </div>

            <div className={styles.summaryList}>
              <div className={styles.summaryRow}><span>Entreprise</span><strong>{company}</strong></div>
              <div className={styles.summaryRow}><span>Lieu</span><strong>{job.location || 'Non renseigné'}</strong></div>
              <div className={styles.summaryRow}><span>Contrat</span><strong>{job.contractType || 'Non renseigné'}</strong></div>
              <div className={styles.summaryRow}><span>Mode</span><strong>{workModeLabel(job.workMode)}</strong></div>
              <div className={styles.summaryRow}><span>Rémunération</span><strong>{compensationLabel(job)}</strong></div>
              <div className={styles.summaryRow}><span>Publication</span><strong>{formatDate(job.publishedAt)}</strong></div>
              <div className={styles.summaryRow}><span>CV recommandé</span><strong>{job.recommendedCv?.name || 'Non renseigné'}</strong></div>
            </div>

            <div className={styles.actions}>
              {sourceUrl && (
                <ButtonLink href={sourceUrl} target="_blank" rel="noreferrer">
                  Ouvrir l’offre source
                </ButtonLink>
              )}
              <ButtonLink href="/offres/review" variant="secondary">
                Aller à la revue
              </ButtonLink>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
