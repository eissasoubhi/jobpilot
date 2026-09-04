'use client';

import { useEffect, useState } from 'react';

import { Card, ErrorBox, Loading, PageHeader } from '@/components/UI';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import type { Profile } from '@/lib/types';

const splitLines = (value: string): string[] => value.split('\n').map((item) => item.trim()).filter(Boolean);
const contractOptions = ['Freelance', 'CDI', 'CDD'] as const;
const workModeOptions = [
  'Aucune préférence',
  'Télétravail uniquement',
  'Hybride ou télétravail',
  'Hybride uniquement',
  'Sur site uniquement',
] as const;

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    void api<Profile>('/profile')
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch((caughtError: unknown) => {
        if (active) setError(getErrorMessage(caughtError));
      });

    return () => {
      active = false;
    };
  }, []);

  if (profile === null) {
    return error !== '' ? <ErrorBox message={error} /> : <Loading />;
  }

  const set = <K extends keyof Profile>(key: K, value: Profile[K]): void => {
    setProfile({ ...profile, [key]: value });
    setMessage('');
  };

  const toggleContract = (contract: string): void => {
    const selected = profile.acceptedContracts.includes(contract)
      ? profile.acceptedContracts.filter((value) => value !== contract)
      : [...profile.acceptedContracts, contract];
    set('acceptedContracts', selected);
  };

  const save = async (): Promise<void> => {
    setError('');
    try {
      setProfile(await api<Profile>('/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      }));
      setMessage('Profil enregistré. Les prochaines offres utiliseront ces préférences.');
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    }
  };

  const technologyExperience = Object.entries(profile.technologyExperience)
    .map(([technology, years]) => `${technology}: ${years}`)
    .join('\n');

  return (
    <>
      <PageHeader
        title="Profil candidat"
        description="Tes informations et préférences utilisées pour filtrer et préparer les candidatures."
        actions={<button className="btn" type="button" onClick={() => void save()}>Enregistrer</button>}
      />
      {message !== '' && <div className="notice">{message}</div>}
      {error !== '' && <ErrorBox message={error} />}
      <div style={{ height: 14 }} />

      <Card>
        <h2>Identité et coordonnées</h2>
        <div className="form-grid">
          <label>Prénom<input value={profile.firstName} onChange={(e) => set('firstName', e.target.value)} autoComplete="given-name" /></label>
          <label>Nom<input value={profile.lastName} onChange={(e) => set('lastName', e.target.value)} autoComplete="family-name" /></label>
          <label>Nom complet<input value={profile.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" /></label>
          <label>E-mail<input type="email" value={profile.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" /></label>
          <label>Téléphone<input value={profile.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" /></label>
          <label>Adresse<input value={profile.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} autoComplete="address-line1" /></label>
          <label>Complément d’adresse<input value={profile.addressLine2 ?? ''} onChange={(e) => set('addressLine2', e.target.value)} autoComplete="address-line2" /></label>
          <label>Ville<input value={profile.city} onChange={(e) => set('city', e.target.value)} autoComplete="address-level2" /></label>
          <label>Code postal<input value={profile.postalCode} onChange={(e) => set('postalCode', e.target.value)} autoComplete="postal-code" /></label>
          <label>Région<input value={profile.region} onChange={(e) => set('region', e.target.value)} autoComplete="address-level1" /></label>
          <label>Pays<input value={profile.country} onChange={(e) => set('country', e.target.value)} autoComplete="country-name" /></label>
          <label>Code pays<input maxLength={2} value={profile.countryCode} onChange={(e) => set('countryCode', e.target.value.toUpperCase())} autoComplete="country" /></label>
        </div>
      </Card>

      <div style={{ height: 14 }} />
      <Card>
        <h2>Profil professionnel</h2>
        <div className="form-grid">
          <label>Poste actuel<input value={profile.currentJobTitle} onChange={(e) => set('currentJobTitle', e.target.value)} /></label>
          <label>Années d’expérience<input type="number" min={0} value={profile.yearsOfExperience} onChange={(e) => set('yearsOfExperience', Number(e.target.value))} /></label>
          <label>LinkedIn<input value={profile.linkedinUrl ?? ''} onChange={(e) => set('linkedinUrl', e.target.value)} /></label>
          <label>GitHub<input value={profile.githubUrl ?? ''} onChange={(e) => set('githubUrl', e.target.value)} /></label>
          <label>Portfolio<input value={profile.portfolioUrl ?? ''} onChange={(e) => set('portfolioUrl', e.target.value)} /></label>
          <label className="full">Autres URLs professionnelles (une par ligne)<textarea value={profile.professionalUrls.join('\n')} onChange={(e) => set('professionalUrls', splitLines(e.target.value))} /></label>
          <label className="full">Expérience par technologie (Technologie: années)<textarea
            value={technologyExperience}
            onChange={(event) => {
              const entries = splitLines(event.target.value).map((line) => {
                const [technology, years] = line.split(':');
                return [technology?.trim() ?? '', Math.max(0, Number(years?.trim() ?? 0))] as const;
              }).filter(([technology]) => technology !== '');
              set('technologyExperience', Object.fromEntries(entries));
            }}
          /></label>
          <label className="full">Langues (une ligne par langue : niveau)<textarea
            value={profile.languages.map((language) => `${language.language}: ${language.level}`).join('\n')}
            onChange={(event) => set('languages', splitLines(event.target.value).map((line) => {
              const [language, ...rest] = line.split(':');
              return { language: language.trim(), level: rest.join(':').trim() };
            }))}
          /></label>
        </div>
      </Card>

      <div style={{ height: 14 }} />
      <Card>
        <h2>Préférences de recherche</h2>
        <p className="muted">
          Ces critères filtrent les offres avant la préparation d’une candidature. Tu peux les modifier à tout moment.
        </p>
        <div className="form-grid">
          <div className="full">
            <strong className="small">Contrats recherchés</strong>
            <div className="actions" style={{ marginTop: 8 }}>
              {contractOptions.map((contract) => (
                <label key={contract} style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <input
                    type="checkbox"
                    checked={profile.acceptedContracts.includes(contract)}
                    onChange={() => toggleContract(contract)}
                    style={{ width: 'auto' }}
                  />
                  {contract}
                </label>
              ))}
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>
              Aucun contrat sélectionné = aucun filtre de contrat.
            </div>
          </div>

          <label>
            Mode de travail recherché
            <select value={profile.workModePreference} onChange={(e) => set('workModePreference', e.target.value)}>
              {workModeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label>Mobilité<input value={profile.mobility} onChange={(e) => set('mobility', e.target.value)} /></label>
          <label>Localisations préférées<input value={profile.preferredLocations.join(', ')} onChange={(e) => set('preferredLocations', e.target.value.split(',').map((v) => v.trim()).filter(Boolean))} /></label>
          <label>Autorisation de travail<input value={profile.workAuthorisation} onChange={(e) => set('workAuthorisation', e.target.value)} /></label>
          <label>Disponibilité<input value={profile.availability} onChange={(e) => set('availability', e.target.value)} /></label>
          <label>Préavis<input value={profile.noticePeriod} onChange={(e) => set('noticePeriod', e.target.value)} /></label>
          <label>Salaire souhaité (€ brut/an)<input type="number" min={0} value={profile.desiredSalary ?? ''} onChange={(e) => set('desiredSalary', e.target.value === '' ? null : Number(e.target.value))} /></label>
          <label>TJM souhaité (€)<input type="number" min={0} value={profile.desiredTjm ?? ''} onChange={(e) => set('desiredTjm', e.target.value === '' ? null : Number(e.target.value))} /></label>
        </div>
      </Card>
    </>
  );
}
