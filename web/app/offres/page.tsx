'use client';

import Link from 'next/link';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { OfferApplicationSummary } from '@/components/OfferApplicationSummary';
import { Badge, Card, Empty, ErrorBox, Loading, PageHeader } from '@/components/UI';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { matchesOfferInboxView, type OfferInboxView } from '@/lib/offer-inbox';
import { matchesProfileContracts } from '@/lib/offer-profile';
import type { Application, Job, JobSourceOccurrence, Profile } from '@/lib/types';

type JobForm = {
  source: string;
  sourceUrl: string;
  title: string;
  company: string;
  clientName: string;
  location: string;
  contractType: string;
  workMode: string;
  description: string;
  publishedAt: string;
  salaryMin: string;
  salaryMax: string;
  tjmFixed: string;
  tjmMin: string;
  tjmMax: string;
};

type ProviderSync = {
  code?: string;
  name: string;
  configured?: boolean;
  enabled?: boolean;
};

type SyncResult = {
  configured: boolean;
  providers: ProviderSync[];
  lastSyncedAt: string | null;
  nextSyncAt: string | null;
  due: boolean;
  busy?: boolean;
  skipped?: boolean;
  message?: string;
  received?: number;
  imported?: number;
  merged?: number;
  duplicates?: number;
  failed?: number;
  errors?: string[];
};

type WorkModeFilter = 'all' | 'remote' | 'hybrid' | 'onsite';

const PAGE_SIZE = 20;

const initialForm: JobForm = {
  source: 'Manuel',
  sourceUrl: '',
  title: '',
  company: '',
  clientName: '',
  location: '',
  contractType: 'Freelance',
  workMode: 'Hybride',
  description: '',
  publishedAt: '',
  salaryMin: '',
  salaryMax: '',
  tjmFixed: '',
  tjmMin: '',
  tjmMax: '',
};

function tone(status: string): 'good' | 'warn' | 'bad' | 'blue' | 'neutral' {
  if (status === 'PREPARED') return 'good';
  if (status === 'REJECTED_BY_FILTER') return 'bad';
  if (status === 'MATCHED') return 'blue';
  return 'neutral';
}

function age(job: Job): string {
  if (job.ageHours == null) return 'Date inconnue';
  if (job.ageHours < 24) return `Il y a ${job.ageHours} h`;
  return `Il y a ${Math.floor(job.ageHours / 24)} j`;
}

function nullableNumber(value: string): number | null {
  return value === '' ? null : Number(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Jamais';

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, ' ')
    .trim();
}

function workModeCategory(value: string): Exclude<WorkModeFilter, 'all'> | 'unknown' {
  const normalized = normalize(value);
  if (normalized === '') return 'unknown';
  if (/teletravail total|full remote|100 ?% remote|remote only|teletravail|remote|distance/.test(normalized)) return 'remote';
  if (/hybride|hybrid/.test(normalized)) return 'hybrid';
  if (/sur site|presentiel|on site|onsite/.test(normalized)) return 'onsite';
  return 'unknown';
}

function occurrences(job: Job): JobSourceOccurrence[] {
  if (job.sources && job.sources.length > 0) return job.sources;

  return [{
    id: null,
    sourceCode: job.sourceCode || job.source.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    sourceName: job.source,
    externalId: null,
    sourceUrl: job.sourceUrl || null,
    matchType: 'LEGACY',
    matchScore: 100,
    matchReasons: [],
    publishedAt: job.publishedAt || null,
    firstSeenAt: job.publishedAt || new Date().toISOString(),
    lastSeenAt: job.publishedAt || new Date().toISOString(),
  }];
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [form, setForm] = useState<JobForm>(initialForm);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState('all');
  const [inboxView, setInboxView] = useState<OfferInboxView>('actionable');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [workModeFilter, setWorkModeFilter] = useState<WorkModeFilter>('all');
  const [syncing, setSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState<SyncResult | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedApplicationIds, setExpandedApplicationIds] = useState<Set<number>>(() => new Set());
  const [expandedSourceIds, setExpandedSourceIds] = useState<Set<number>>(() => new Set());

  const loadJobs = useCallback(async (): Promise<void> => {
    const result = await api<Job[]>('/jobs');
    setJobs(result);
  }, []);

  const loadProfile = useCallback(async (): Promise<void> => {
    const result = await api<Profile>('/profile');
    setProfile(result);
  }, []);

  const loadCatalog = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([loadJobs(), loadProfile()]);
      setError('');
    } catch (caughtError: unknown) {
      setJobs((current) => current ?? []);
      setError(`Impossible de charger les offres avec les préférences du profil : ${getErrorMessage(caughtError)}`);
    }
  }, [loadJobs, loadProfile]);

  const loadApplications = useCallback(async (): Promise<void> => {
    try {
      const result = await api<Application[]>('/applications');
      setApplications(result);
    } catch (caughtError: unknown) {
      setApplications((current) => current ?? []);
      setError(`Les offres restent disponibles, mais les candidatures préparées ne peuvent pas être chargées : ${getErrorMessage(caughtError)}`);
    }
  }, []);

  const refreshWorkspace = useCallback(async (): Promise<void> => {
    await Promise.all([loadJobs(), loadProfile(), loadApplications()]);
  }, [loadApplications, loadJobs, loadProfile]);

  const syncJobs = useCallback(async (force: boolean): Promise<void> => {
    setSyncing(true);
    if (force) setError('');

    try {
      const result = await api<SyncResult>(`/job-search/sync${force ? '?force=1' : ''}`, { method: 'POST' });
      setSyncInfo(result);
      await Promise.all([loadJobs(), loadProfile()]);
      void loadApplications();
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    } finally {
      setSyncing(false);
    }
  }, [loadApplications, loadJobs, loadProfile]);

  useEffect(() => {
    let active = true;

    const savedWorkMode = window.localStorage.getItem('jobpilot.offers.workModeFilter');
    if (savedWorkMode && ['all', 'remote', 'hybrid', 'onsite'].includes(savedWorkMode)) {
      setWorkModeFilter(savedWorkMode as WorkModeFilter);
    }

    void (async () => {
      await loadCatalog();
      if (!active) return;

      void loadApplications();
      void syncJobs(false);
    })();

    return () => {
      active = false;
    };
  }, [loadApplications, loadCatalog, syncJobs]);

  const changeWorkModeFilter = (value: WorkModeFilter): void => {
    setWorkModeFilter(value);
    window.localStorage.setItem('jobpilot.offers.workModeFilter', value);
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');

    try {
      await api('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          salaryMin: nullableNumber(form.salaryMin),
          salaryMax: nullableNumber(form.salaryMax),
          tjmFixed: nullableNumber(form.tjmFixed),
          tjmMin: nullableNumber(form.tjmMin),
          tjmMax: nullableNumber(form.tjmMax),
          proposedTjm: undefined,
          publishedAt: form.publishedAt || null,
        }),
      });
      setForm(initialForm);
      setShow(false);
      await refreshWorkspace();
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    }
  };

  const prepare = async (id: number): Promise<void> => {
    try {
      await api(`/jobs/${id}/prepare`, { method: 'POST' });
      await refreshWorkspace();
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    }
  };

  const updateApplication = useCallback((updated: Application): void => {
    setApplications((current) => current?.map((application) => (
      application.id === updated.id ? updated : application
    )) ?? current);
  }, []);

  const sources = useMemo(
    () => Array.from(new Set(
      (jobs ?? []).flatMap((job) => occurrences(job).map((source) => source.sourceName)).filter(Boolean),
    )).sort((a, b) => a.localeCompare(b, 'fr')),
    [jobs],
  );

  const applicationsByJobId = useMemo(
    () => new Map((applications ?? []).map((application) => [application.jobOffer.id, application])),
    [applications],
  );

  const displayed = useMemo(
    () => jobs?.filter((job) => (
      (profile === null || matchesProfileContracts(job, profile))
      && (filter === 'all' || job.status === filter)
      && (sourceFilter === 'all' || occurrences(job).some((source) => source.sourceName === sourceFilter))
      && (workModeFilter === 'all' || workModeCategory(job.workMode) === workModeFilter)
      && matchesOfferInboxView(applicationsByJobId.get(job.id), inboxView)
    )) ?? [],
    [jobs, profile, filter, sourceFilter, workModeFilter, applicationsByJobId, inboxView],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, inboxView, profile, sourceFilter, workModeFilter]);

  const visibleJobs = displayed.slice(0, visibleCount);
  const hiddenCount = Math.max(displayed.length - visibleJobs.length, 0);
  const activeProviders = syncInfo?.providers.filter((provider) => provider.configured !== false && provider.enabled !== false) ?? [];
  const contractSummary = profile?.acceptedContracts.length
    ? profile.acceptedContracts.join(', ')
    : 'Tous les contrats';

  const toggleExpanded = (setter: typeof setExpandedApplicationIds, current: Set<number>, id: number): void => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  return (
    <>
      <PageHeader
        title="Offres"
        description="Les offres qui correspondent à ton profil, prêtes à être examinées sans surcharge."
        actions={
          <div className="actions">
            <button className="btn secondary" type="button" disabled={syncing} onClick={() => void syncJobs(true)}>
              {syncing ? 'Recherche en cours…' : 'Rechercher maintenant'}
            </button>
            <button className="btn" type="button" onClick={() => setShow(true)}>Ajouter une offre</button>
          </div>
        }
      />
      {error !== '' && <ErrorBox message={error} />}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div className="actions" style={{ alignItems: 'center' }}>
              <strong>Critères du profil</strong>
              {profile?.acceptedContracts.map((contract) => <Badge key={contract} tone="blue">{contract}</Badge>)}
              {profile?.acceptedContracts.length === 0 && <Badge>Tous les contrats</Badge>}
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>
              Les contrats affichés viennent directement de la page Profil. Aucun filtre contrat séparé n’est appliqué ici.
            </div>
          </div>
          <Link className="btn secondary small" href="/profil">Modifier le profil</Link>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="actions" style={{ alignItems: 'center' }}>
            <strong>Synchronisation</strong>
            <Badge tone={syncing ? 'blue' : 'good'}>{syncing ? 'En cours' : 'À jour'}</Badge>
            {syncInfo?.imported != null && <Badge tone="good">{syncInfo.imported} nouvelle(s)</Badge>}
            {syncInfo?.merged != null && <Badge tone="blue">{syncInfo.merged} fusionnée(s)</Badge>}
            {syncInfo?.failed != null && syncInfo.failed > 0 && <Badge tone="warn">{syncInfo.failed} échec(s)</Badge>}
          </div>
          <span className="small muted">Dernière recherche : {formatDate(syncInfo?.lastSyncedAt)}</span>
        </div>
        {syncInfo && (
          <details style={{ marginTop: 10 }} open={syncing || undefined}>
            <summary className="small muted">Détails de la synchronisation</summary>
            <div className="small muted" style={{ marginTop: 8 }}>
              {activeProviders.length} source{activeProviders.length > 1 ? 's' : ''} active{activeProviders.length > 1 ? 's' : ''}
              {syncInfo.message ? ` · ${syncInfo.message}` : ''}
            </div>
            {syncInfo.errors && syncInfo.errors.length > 0 && (
              <ul>{syncInfo.errors.map((syncError) => <li className="small" key={syncError}>{syncError}</li>)}</ul>
            )}
          </details>
        )}
      </Card>

      <Card>
        <div className="form-grid">
          <label>
            Source
            <select aria-label="Filtrer par source" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
              <option value="all">Toutes les sources</option>
              {sources.map((source) => <option key={source} value={source}>{source}</option>)}
            </select>
          </label>
          <label>
            Mode de travail
            <select
              aria-label="Filtrer par mode de travail"
              value={workModeFilter}
              onChange={(event) => changeWorkModeFilter(event.target.value as WorkModeFilter)}
            >
              <option value="all">Tous les modes</option>
              <option value="remote">Télétravail</option>
              <option value="hybrid">Hybride</option>
              <option value="onsite">Sur site</option>
            </select>
          </label>
        </div>
      </Card>

      <div className="tabs" aria-label="Boîte des offres">
        {[
          ['actionable', 'À traiter'],
          ['submitted', 'Envoyées'],
          ['ignored', 'Ignorées'],
        ].map(([value, label]) => (
          <button key={value} className={inboxView === value ? 'active' : ''} type="button" onClick={() => setInboxView(value as OfferInboxView)}>
            {label}
          </button>
        ))}
      </div>

      <div className="tabs" aria-label="Filtres des offres">
        {[
          ['all', 'Toutes'],
          ['PREPARED', 'Préparées'],
          ['MATCHED', 'À examiner'],
          ['REJECTED_BY_FILTER', 'Exclues'],
        ].map(([value, label]) => (
          <button key={value} className={filter === value ? 'active' : ''} type="button" onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>

      <Card>
        {jobs === null || profile === null ? (
          <Loading />
        ) : displayed.length === 0 ? (
          <Empty>Aucune offre ne correspond à ton profil et aux filtres sélectionnés.</Empty>
        ) : (
          <>
            <div className="small muted" style={{ marginBottom: 10 }}>
              {displayed.length} offre{displayed.length > 1 ? 's' : ''} · contrats du profil : <strong>{contractSummary}</strong>
            </div>
            {visibleJobs.map((job) => {
              const jobOccurrences = occurrences(job);
              const application = applicationsByJobId.get(job.id);
              const applicationExpanded = expandedApplicationIds.has(job.id);
              const sourcesExpanded = expandedSourceIds.has(job.id);

              return (
                <div className="list-row" key={job.id}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="actions" style={{ marginBottom: 6 }}>
                      <Badge tone={tone(job.status)}>{job.status}</Badge>
                      <Badge>{job.contractType || 'Contrat inconnu'}</Badge>
                      <Badge>{job.workMode || 'Mode inconnu'}</Badge>
                      {jobOccurrences.slice(0, 2).map((source) => (
                        <Badge key={`${source.sourceCode}-${source.externalId || source.sourceUrl || source.sourceName}`}>{source.sourceName}</Badge>
                      ))}
                      {jobOccurrences.length > 2 && <Badge>+{jobOccurrences.length - 2} source(s)</Badge>}
                    </div>
                    <h3 style={{ marginBottom: 4 }}>{job.title}</h3>
                    <div className="muted small">
                      {job.company || 'Entreprise non renseignée'} · {job.location || 'Lieu non renseigné'} · {age(job)}
                    </div>
                    {(job.proposedTjm != null || job.proposedSalary != null) && (
                      <div className="actions" style={{ marginTop: 7 }}>
                        {job.proposedTjm != null && <Badge tone="good">TJM proposé : {job.proposedTjm} €</Badge>}
                        {job.proposedSalary != null && <Badge tone="good">Salaire proposé : {job.proposedSalary.toLocaleString('fr-FR')} €</Badge>}
                      </div>
                    )}

                    <div className="actions" style={{ marginTop: 10 }}>
                      {job.sourceUrl && (
                        <a className="btn secondary small" href={job.sourceUrl} target="_blank" rel="noreferrer">Ouvrir l’offre</a>
                      )}
                      {application && (
                        <button
                          className="btn secondary small"
                          type="button"
                          aria-expanded={applicationExpanded}
                          onClick={() => toggleExpanded(setExpandedApplicationIds, expandedApplicationIds, job.id)}
                        >
                          {applicationExpanded ? 'Masquer la candidature' : 'Voir la candidature'}
                        </button>
                      )}
                      {jobOccurrences.length > 1 && (
                        <button
                          className="btn secondary small"
                          type="button"
                          aria-expanded={sourcesExpanded}
                          onClick={() => toggleExpanded(setExpandedSourceIds, expandedSourceIds, job.id)}
                        >
                          {sourcesExpanded ? 'Masquer les sources' : `Voir les ${jobOccurrences.length} sources`}
                        </button>
                      )}
                      {job.status !== 'PREPARED' && job.status !== 'REJECTED_BY_FILTER' && (
                        <button className="btn small" type="button" onClick={() => void prepare(job.id)}>Préparer</button>
                      )}
                    </div>

                    {application && applicationExpanded && (
                      <div style={{ marginTop: 10 }}>
                        <OfferApplicationSummary application={application} onApplicationUpdated={updateApplication} />
                      </div>
                    )}

                    {sourcesExpanded && (
                      <div className="stack" style={{ gap: 8, marginTop: 10 }}>
                        {jobOccurrences.map((source) => (
                          <div className="notice" key={`${source.sourceCode}-${source.externalId || source.sourceUrl || source.sourceName}`}>
                            <strong>{source.sourceName}</strong>
                            {source.sourceUrl && (
                              <> · <a href={source.sourceUrl} target="_blank" rel="noreferrer">ouvrir</a></>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="score" aria-label={`Score ${job.score}`}>{job.score}</div>
                </div>
              );
            })}

            {hiddenCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <button className="btn secondary" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                  Afficher {Math.min(PAGE_SIZE, hiddenCount)} offre{Math.min(PAGE_SIZE, hiddenCount) > 1 ? 's' : ''} de plus
                </button>
              </div>
            )}
          </>
        )}
      </Card>

      {jobs?.some((job) => occurrences(job).some((source) => source.sourceName === 'Adzuna')) && (
        <p className="small muted">Jobs by <a href="https://www.adzuna.fr" target="_blank" rel="noreferrer">Adzuna</a></p>
      )}

      {show && (
        <div className="modal-backdrop" onMouseDown={() => setShow(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Ajouter une offre" onMouseDown={(event) => event.stopPropagation()}>
            <PageHeader title="Ajouter une offre" actions={<button className="btn secondary" type="button" onClick={() => setShow(false)}>Fermer</button>} />
            <form className="form-grid" onSubmit={(event) => void submit(event)}>
              <label>Source<input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></label>
              <label>URL<input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} /></label>
              <label>Intitulé<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
              <label>Entreprise<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
              <label>Client final éventuel<input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></label>
              <label>Lieu<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
              <label>
                Contrat
                <select value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })}>
                  <option>Freelance</option><option>Portage salarial</option><option>Sous-traitance</option><option>CDI</option><option>CDD</option>
                </select>
              </label>
              <label>Mode de travail<input value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })} /></label>
              <label>Date de publication<input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} /></label>
              <label>Salaire min. annuel<input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} /></label>
              <label>Salaire max. annuel<input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} /></label>
              <label>TJM fixe<input type="number" value={form.tjmFixed} onChange={(e) => setForm({ ...form, tjmFixed: e.target.value })} /></label>
              <label>TJM minimum<input type="number" value={form.tjmMin} onChange={(e) => setForm({ ...form, tjmMin: e.target.value })} /></label>
              <label>TJM maximum<input type="number" value={form.tjmMax} onChange={(e) => setForm({ ...form, tjmMax: e.target.value })} /></label>
              <label className="full">Description<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <button className="btn full" type="submit">Analyser et enregistrer</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
