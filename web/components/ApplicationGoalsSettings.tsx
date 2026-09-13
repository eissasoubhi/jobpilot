'use client';

import { type FormEvent, useEffect, useState } from 'react';

import { Skeleton, SkeletonGroup } from '@/components/Skeleton';
import { Button, Card, ErrorBox, FormField, InlineFeedback } from '@/components/UI';
import { api } from '@/lib/api';
import type { ApplicationGoalSnapshot } from '@/lib/application-goals';
import { getErrorMessage } from '@/lib/errors';

import styles from './ApplicationGoals.module.css';

export type GoalDraft = {
  daily: string;
  weekly: string;
  monthly: string;
};

type ApplicationGoalsSettingsViewProps = {
  draft: GoalDraft;
  error?: string;
  loading?: boolean;
  saved?: boolean;
  saving?: boolean;
  onDraftChange: (period: keyof GoalDraft, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function draftFromSnapshot(snapshot: ApplicationGoalSnapshot): GoalDraft {
  return {
    daily: String(snapshot.config.daily),
    weekly: String(snapshot.config.weekly),
    monthly: String(snapshot.config.monthly),
  };
}

function toGoalValue(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function ApplicationGoalsSettingsView({
  draft,
  error = '',
  loading = false,
  saved = false,
  saving = false,
  onDraftChange,
  onSubmit,
}: ApplicationGoalsSettingsViewProps) {
  return (
    <div className={styles.settingsSection}>
      <Card>
        <h2 className="section-title">Objectifs de candidatures</h2>
        <p className="muted">Configure ici le rythme de candidatures. La Review Queue affiche uniquement la progression.</p>

        {loading ? (
          <SkeletonGroup label="Chargement des objectifs de candidatures" className={styles.settingsForm}>
            <div className={styles.settingsGrid}>
              {[0, 1, 2].map((index) => (
                <div key={index} className={styles.goalSkeletonField}>
                  <Skeleton width="48%" height={12} />
                  <Skeleton height={40} />
                </div>
              ))}
            </div>
            <div className={styles.settingsFooter}>
              <Skeleton width="58%" height={12} />
              <Skeleton width={180} height={34} />
            </div>
          </SkeletonGroup>
        ) : (
          <form className={styles.settingsForm} onSubmit={onSubmit}>
            <div className={styles.settingsGrid}>
              <FormField label="Objectif / jour">
                <input
                  aria-label="Objectif journalier de candidatures"
                  min="0"
                  max="100"
                  inputMode="numeric"
                  type="number"
                  value={draft.daily}
                  onChange={(event) => onDraftChange('daily', event.target.value)}
                />
              </FormField>
              <FormField label="Objectif / semaine">
                <input
                  aria-label="Objectif hebdomadaire de candidatures"
                  min="0"
                  max="500"
                  inputMode="numeric"
                  type="number"
                  value={draft.weekly}
                  onChange={(event) => onDraftChange('weekly', event.target.value)}
                />
              </FormField>
              <FormField label="Objectif / mois">
                <input
                  aria-label="Objectif mensuel de candidatures"
                  min="0"
                  max="2000"
                  inputMode="numeric"
                  type="number"
                  value={draft.monthly}
                  onChange={(event) => onDraftChange('monthly', event.target.value)}
                />
              </FormField>
            </div>

            <div className={styles.settingsFooter}>
              <p className={styles.settingsHint}>0 désactive une cadence · semaine du lundi au dimanche · fuseau horaire du navigateur.</p>
              <Button loading={saving} size="small" type="submit">
                {saving ? 'Enregistrement…' : 'Enregistrer les objectifs'}
              </Button>
            </div>

            {error !== '' && <ErrorBox message={error} />}
            {saved && <InlineFeedback tone="success">Objectifs enregistrés.</InlineFeedback>}
          </form>
        )}
      </Card>
    </div>
  );
}

export function ApplicationGoalsSettings() {
  const [snapshot, setSnapshot] = useState<ApplicationGoalSnapshot | null>(null);
  const [draft, setDraft] = useState<GoalDraft>({ daily: '0', weekly: '0', monthly: '0' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void api<ApplicationGoalSnapshot>('/application-goals')
      .then((result) => {
        if (!active) return;
        setSnapshot(result);
        setDraft(draftFromSnapshot(result));
        setError('');
      })
      .catch((caughtError: unknown) => {
        if (active) setError(getErrorMessage(caughtError));
      });

    return () => { active = false; };
  }, []);

  const save = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const result = await api<ApplicationGoalSnapshot>('/application-goals', {
        method: 'PUT',
        body: JSON.stringify({
          daily: toGoalValue(draft.daily),
          weekly: toGoalValue(draft.weekly),
          monthly: toGoalValue(draft.monthly),
          timezone: browserTimezone || snapshot?.config.timezone || 'Europe/Paris',
        }),
      });
      setSnapshot(result);
      setDraft(draftFromSnapshot(result));
      setSaved(true);
      window.dispatchEvent(new Event('jobpilot:application-goals-changed'));
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ApplicationGoalsSettingsView
      draft={draft}
      error={error}
      loading={snapshot === null && error === ''}
      saved={saved}
      saving={saving}
      onDraftChange={(period, value) => setDraft((current) => ({ ...current, [period]: value }))}
      onSubmit={(event) => void save(event)}
    />
  );
}
