'use client';

import Link from 'next/link';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { FilterTabs } from '@/components/FilterTabs';
import { Modal } from '@/components/Modal';
import { OfferApplicationSummary } from '@/components/OfferApplicationSummary';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  DataList,
  DataListItem,
  DataToolbar,
  Empty,
  ErrorBox,
  FormField,
  Loading,
  OfflineState,
  PageHeader,
} from '@/components/UI';
import { api } from '@/lib/api';
import { crmOrganizationHref } from '@/lib/crm-navigation';
import { getErrorMessage } from '@/lib/errors';
import { jobTargetCompany } from '@/lib/job-target-company';
import { matchesOfferInboxView, type OfferInboxView } from '@/lib/offer-inbox';
import type { Application, Job, JobSourceOccurrence } from '@/lib/types';

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
  mode?: string;
  configured?: boolean;
  enabled?: boolean;
  received?: number;
  imported?: number;
  merged?: number;
  duplicates?: number;
  failed?: number;
  error?: string | null;
};

type SyncResult = {
  configured?: boolean;
  providers: ProviderSync[];
  lastSyncedAt: string | null;
  nextSyncAt: string | null;
  due?: boolean;
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

type SyncJob = {
  id: string;
  status: 'queued' | 'running' | 'success' | 'partial' | 'failed';
  queuedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  updatedAt: string;
  deduplicated?: boolean;
  progress?: {
    completed: number;
    total: number;
    currentConnector?: string | null;
  };
  result: SyncResult | null;
  error?: {
    code?: string;
    message?: string;
  } | null;
};

type SyncJobResponse = { job: SyncJob };

const initialForm: JobForm = {
  source: 'Manuel',
  sourceUrl: '',
  title: '',
  company: '',
  clientName: '',
  location: '',
  contractType: 'CDI',
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

function matchLabel(matchType: string): string {
  return {
    PRIMARY: 'Source principale',
    EXACT_SOURCE_ID: 'Occurrence déjà connue',
    EXACT_URL: 'Fusion par URL',
    EXACT_FINGERPRINT: 'Fusion exacte',
    SIMILARITY: 'Fusion par similarité',
    LEGACY: 'Source historique',
  }[matchType] ?? matchType;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function isTerminalSync(status: SyncJob['status']): boolean {
  return status === 'success' || status === 'partial' || status === 'failed';
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [form, setForm] = useState<JobForm>(initialForm);
  const [error, setError] = useState('');
  const [catalogError, setCatalogError] = useState('');
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState('all');
  const [inboxView, setInboxView] = useState<OfferInboxView>('actionable');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState<SyncResult | null>(null);
  const [syncRun, setSyncRun] = useState<SyncJob | null>(null);

  const loadJobs = useCallback(async (): Promise<boolean> => {
    try {
      const result = await api<Job[]>('/jobs');
      setJobs(result);
      setCatalogError('');
      return true;
    } catch (caughtError: unknown) {
      setCatalogError(getErrorMessage(caughtError));
      return false;
    }
  }, []);

  const loadApplications = useCallback(async (): Promise<void> => {
    try {
      const result = await api<Application[]>('/applications');
      setApplications(result);
    } catch (caughtError: unknown) {
      setApplications((current) => current ?? []);
      setError(`Les offres restent disponibles, mais les préparations de candidature sont indisponibles : ${getErrorMessage(caughtError)}`);
    }
  }, []);

  const refreshWorkspace = useCallback(async (): Promise<void> => {
    await Promise.all([loadJobs(), loadApplications()]);
  }, [loadApplications, loadJobs]);

  const pollSync = useCallback(async (initialJob: SyncJob): Promise<SyncJob> => {
    let job = initialJob;
    setSyncRun(job);

    while (!isTerminalSync(job.status)) {
      await wait(1000);
      const response = await api<SyncJobResponse>(`/job-search/sync/${encodeURIComponent(job.id)}`);
      job = response.job;
      setSyncRun(job);
    }

    return job;
  }, []);

  const syncJobs = useCallback(async (force: boolean): Promise<void> => {
    setSyncing(true);
    if (force) setError('');

    try {
      const queued = await api<SyncJobResponse>(`/job-search/sync${force ? '?force=1' : ''}`, {
        method: 'POST',
      });
      const completed = await pollSync(queued.job);

      if (completed.result) {
        setSyncInfo({
          ...completed.result,
          providers: completed.result.providers ?? [],
        });
      }
      if (completed.status === 'failed') {
        throw new Error(completed.error?.message ?? 'La recherche d’offres a échoué.');
      }

      await loadJobs();
      void loadApplications();
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    } finally {
      setSyncing(false);
    }
  }, [loadApplications, loadJobs, pollSync]);

  const retryWorkspace = useCallback(async (): Promise<void> => {
    setError('');
    setCatalogError('');
    const loaded = await loadJobs();
    if (!loaded) return;

    void loadApplications();
    void syncJobs(false);
  }, [loadApplications, loadJobs, syncJobs]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const loaded = await loadJobs();
      if (!active || !loaded) return;

      void loadApplications();
      void syncJobs(false);
    })();

    return () => {
      active = false;
    };
  }, [loadApplications, loadJobs, syncJobs]);

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
      (filter === 'all' || job.status === filter)
      && (sourceFilter === 'all' || occurrences(job).some((source) => source.sourceName === sourceFilter))
      && matchesOfferInboxView(applicationsByJobId.get(job.id), inboxView)
    )) ?? [],
    [jobs, filter, sourceFilter, applicationsByJobId, inboxView],
  );

  const providerNames = (syncInfo?.providers ?? [])
    .filter((provider) => provider.configured !== false && provider.enabled !== false)
    .map((provider) => provider.name)
    .join(', ');

  const progress = syncRun?.progress;
  const syncStatusMessage = syncRun?.status === 'queued'
    ? 'Recherche mise en file…'
    : syncRun?.status === 'running'
      ? progress && progress.total > 0
        ? `Recherche en arrière-plan (${progress.completed}/${progress.total})…`
        : 'Recherche en arrière-plan…'
      : syncRun?.status === 'partial'
        ? 'Recherche terminée avec certaines sources indisponibles.'
        : syncRun?.status === 'success'
          ? 'Recherche terminée.'
          : null;
  const isCatalogOffline = catalogError !== '';

  return (
    <>
      <PageHeader
        title="Offres"
        description="Examine l’offre, son score et les éléments de candidature déjà préparés depuis un seul espace."
        actions={
          <div className="actions">
            <Link className="btn secondary" href="/connecteurs">Gérer les connecteurs</Link>
            <Button variant="secondary" disabled={syncing || isCatalogOffline} onClick={() => void syncJobs(true)}>
              {syncing ? 'Recherche en cours…' : 'Rechercher maintenant'}
            </Button>
            <Button disabled={isCatalogOffline} onClick={() => setShow(true)}>Ajouter une offre</Button>
          </div>
        }
      />

      {isCatalogOffline ? (
        <OfflineState
          title="JobPilot ne peut pas charger les offres"
          message="L’API locale est indisponible pour le moment. Les données et la synchronisation restent en pause jusqu’au retour du service."
          technicalDetail={catalogError}
          onRetry={() => void retryWorkspace()}
        />
      ) : (
        <>
          {error !== '' && <ErrorBox message={error} />}

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <div className="actions" style={{ alignItems: 'center' }}>
                  <strong>Recherche automatique</strong>
                  <Badge tone={syncing ? 'blue' : 'good'}>{syncing ? 'Worker actif' : 'Données locales affichées'}</Badge>
                  {applications === null && <Badge>Suivi candidatures en cours…</Badge>}
                </div>
                <div className="muted small" style={{ marginTop: 7 }}>
                  {syncing
                    ? syncStatusMessage ?? 'La recherche est exécutée en arrière-plan sans bloquer JobPilot.'
                    : syncInfo?.message ?? syncStatusMessage ?? 'Les offres locales sont affichées en premier. La recherche automatique complète ensuite la liste sans bloquer la page.'}
                </div>
              </div>
              <div className="small muted">Dernière recherche : <strong>{formatDate(syncInfo?.lastSyncedAt)}</strong></div>
            </div>

            {syncInfo && (
              <div className="actions" style={{ marginTop: 12 }}>
                <Badge tone="blue">Sources : {providerNames || 'aucune'}</Badge>
                {syncInfo.imported != null && <Badge tone="good">{syncInfo.imported} nouvelle(s)</Badge>}
                {syncInfo.merged != null && <Badge tone="blue">{syncInfo.merged} source(s) fusionnée(s)</Badge>}
                {syncInfo.duplicates != null && <Badge>{syncInfo.duplicates} occurrence(s) connue(s)</Badge>}
                {syncInfo.failed != null && syncInfo.failed > 0 && <Badge tone="warn">{syncInfo.failed} échec(s)</Badge>}
              </div>
            )}

            {syncInfo?.errors && syncInfo.errors.length > 0 && (
              <details style={{ marginTop: 10 }}>
                <summary className="small muted">Détails des sources indisponibles</summary>
                <ul>{syncInfo.errors.map((syncError) => <li className="small" key={syncError}>{syncError}</li>)}</ul>
              </details>
            )}

            <p className="small muted" style={{ marginBottom: 0, marginTop: 12 }}>
              Une nouvelle plateforme ajoute une occurrence à l’offre existante lorsqu’URL, entreprise et intitulé correspondent avec une confiance suffisante.
            </p>
          </Card>

          <Card>
            <DataToolbar>
              <div style={{ maxWidth: 360 }}>
                <FormField label="Filtrer par source">
                  <select aria-label="Filtrer par source" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                    <option value="all">Toutes les sources</option>
                    {sources.map((source) => <option key={source} value={source}>{source}</option>)}
                  </select>
                </FormField>
              </div>
            </DataToolbar>
          </Card>

          <FilterTabs
            ariaLabel="Boîte des offres"
            value={inboxView}
            onChange={setInboxView}
            options={[
              { value: 'actionable', label: 'À traiter' },
              { value: 'submitted', label: 'Envoyées' },
              { value: 'ignored', label: 'Ignorées' },
              { value: 'archived', label: 'Archivées' },
            ] as const}
          />

          <FilterTabs
            ariaLabel="Filtres des offres"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Toutes' },
              { value: 'PREPARED', label: 'Préparées' },
              { value: 'MATCHED', label: 'À examiner' },
              { value: 'REJECTED_BY_FILTER', label: 'Exclues' },
            ] as const}
          />

          <Card>
            {jobs === null ? (
              <Loading />
            ) : displayed.length === 0 ? (
              <Empty>Aucune offre ne correspond aux filtres sélectionnés.</Empty>
            ) : (
              <DataList aria-label="Offres filtrées">
                {displayed.map((job) => {
                  const jobOccurrences = occurrences(job);
                  const application = applicationsByJobId.get(job.id);
                  const crmContextHref = crmOrganizationHref(jobTargetCompany(job));

                  return (
                    <DataListItem key={job.id}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="actions" style={{ marginBottom: 6 }}>
                          <Badge tone={tone(job.status)}>{job.status}</Badge>
                          <Badge tone="blue">{job.language === 'fr' ? 'FR' : 'EN'}</Badge>
                          <Badge>{job.contractType || 'Contrat inconnu'}</Badge>
                          <Badge tone={jobOccurrences.length > 1 ? 'blue' : 'neutral'}>{jobOccurrences.length} source{jobOccurrences.length > 1 ? 's' : ''}</Badge>
                          {jobOccurrences.slice(0, 4).map((source) => (
                            <Badge key={`${source.sourceCode}-${source.externalId || source.sourceUrl || source.sourceName}`}>{source.sourceName}</Badge>
                          ))}
                          {jobOccurrences.length > 4 && <Badge>+{jobOccurrences.length - 4}</Badge>}
                          {job.proposedTjm != null && <Badge tone="good">TJM proposé : {job.proposedTjm} €</Badge>}
                          {job.proposedSalary != null && <Badge tone="good">Salaire proposé : {job.proposedSalary.toLocaleString('fr-FR')} €</Badge>}
                        </div>
                        <h3>{job.title}</h3>
                        <div className="muted small">
                          {job.company || 'Entreprise non renseignée'} · {job.location || 'Lieu non renseigné'} · {age(job)}
                        </div>
                        {job.recommendedCv && <div className="small" style={{ marginTop: 7 }}>CV conseillé : <strong>{job.recommendedCv.name}</strong></div>}
                        {application && <OfferApplicationSummary application={application} onApplicationUpdated={updateApplication} />}
                        <details style={{ marginTop: 8 }}>
                          <summary className="small muted">Pourquoi ce score ?</summary>
                          <ul>{(job.scoreReasons ?? []).map((reason) => <li key={reason} className="small">{reason}</li>)}</ul>
                        </details>
                        <details style={{ marginTop: 8 }}>
                          <summary className="small muted">Sources de cette offre ({jobOccurrences.length})</summary>
                          <div className="stack" style={{ gap: 8, marginTop: 10 }}>
                            {jobOccurrences.map((source) => (
                              <div className="notice" key={`${source.sourceCode}-${source.externalId || source.sourceUrl || source.sourceName}`}>
                                <div className="actions">
                                  <strong>{source.sourceName}</strong>
                                  <Badge tone={source.matchType === 'PRIMARY' || source.matchType === 'LEGACY' ? 'neutral' : 'blue'}>{matchLabel(source.matchType)}</Badge>
                                  {source.matchType !== 'PRIMARY' && source.matchType !== 'LEGACY' && <Badge>{source.matchScore} %</Badge>}
                                </div>
                                <div className="small muted">Vu du {formatDate(source.firstSeenAt)} au {formatDate(source.lastSeenAt)}</div>
                                {source.sourceUrl && <a href={source.sourceUrl} target="_blank" rel="noreferrer">Ouvrir cette source</a>}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                      <div style={{ minWidth: 150, textAlign: 'right' }}>
                        <strong style={{ fontSize: 24 }}>{job.score}%</strong>
                        <div className="muted small">score</div>
                        <div className="stack" style={{ gap: 8, marginTop: 10 }}>
                          <ButtonLink href={`/offres/${job.id}`}>Voir le détail</ButtonLink>
                          {crmContextHref && <ButtonLink variant="secondary" href={crmContextHref}>Voir dans le CRM</ButtonLink>}
                          {!application && <Button variant="secondary" size="small" onClick={() => void prepare(job.id)}>Préparer</Button>}
                        </div>
                      </div>
                    </DataListItem>
                  );
                })}
              </DataList>
            )}
          </Card>
        </>
      )}

      <Modal open={show} title="Ajouter une offre" onClose={() => setShow(false)}>
        <form className="stack" onSubmit={submit}>
          <FormField label="Source"><input aria-label="Source" value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} /></FormField>
          <FormField label="URL"><input aria-label="URL" type="url" value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} /></FormField>
          <FormField label="Intitulé"><input aria-label="Intitulé" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></FormField>
          <FormField label="Entreprise"><input aria-label="Entreprise" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></FormField>
          <FormField label="Client final"><input aria-label="Client final" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} /></FormField>
          <FormField label="Lieu"><input aria-label="Lieu" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></FormField>
          <FormField label="Contrat"><select aria-label="Contrat" value={form.contractType} onChange={(event) => setForm({ ...form, contractType: event.target.value })}><option>CDI</option><option>Freelance</option><option>CDD</option></select></FormField>
          <FormField label="Mode de travail"><select aria-label="Mode de travail" value={form.workMode} onChange={(event) => setForm({ ...form, workMode: event.target.value })}><option>Remote</option><option>Hybride</option><option>Sur site</option></select></FormField>
          <FormField label="Description"><textarea aria-label="Description" rows={7} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField>
          <FormField label="Date de publication"><input aria-label="Date de publication" type="date" value={form.publishedAt} onChange={(event) => setForm({ ...form, publishedAt: event.target.value })} /></FormField>
          <div className="form-grid">
            <FormField label="Salaire min"><input aria-label="Salaire min" type="number" value={form.salaryMin} onChange={(event) => setForm({ ...form, salaryMin: event.target.value })} /></FormField>
            <FormField label="Salaire max"><input aria-label="Salaire max" type="number" value={form.salaryMax} onChange={(event) => setForm({ ...form, salaryMax: event.target.value })} /></FormField>
          </div>
          <div className="form-grid">
            <FormField label="TJM fixe"><input aria-label="TJM fixe" type="number" value={form.tjmFixed} onChange={(event) => setForm({ ...form, tjmFixed: event.target.value })} /></FormField>
            <FormField label="TJM minimum"><input aria-label="TJM minimum" type="number" value={form.tjmMin} onChange={(event) => setForm({ ...form, tjmMin: event.target.value })} /></FormField>
            <FormField label="TJM maximum"><input aria-label="TJM maximum" type="number" value={form.tjmMax} onChange={(event) => setForm({ ...form, tjmMax: event.target.value })} /></FormField>
          </div>
          <div className="actions"><Button type="submit">Analyser et enregistrer</Button><Button type="button" variant="secondary" onClick={() => setShow(false)}>Annuler</Button></div>
        </form>
      </Modal>
    </>
  );
}
