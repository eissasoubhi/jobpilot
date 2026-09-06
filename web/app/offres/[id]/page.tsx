'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { OfferEditorialDetail } from '@/components/offers/OfferEditorialDetail';
import { ErrorBox, Loading, PageHeader } from '@/components/UI';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import type { Job } from '@/lib/types';

export default function OfferDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    if (!/^\d+$/.test(id)) {
      setError('Identifiant d’offre invalide.');
      setJob(null);
      return () => {
        active = false;
      };
    }

    setError('');
    setJob(null);

    void api<Job>(`/jobs/${encodeURIComponent(id)}`)
      .then((result) => {
        if (active) {
          setJob(result);
          setError('');
        }
      })
      .catch((caughtError: unknown) => {
        if (active) {
          setError(getErrorMessage(caughtError));
        }
      });

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  if (error !== '') {
    return (
      <>
        <PageHeader title="Détail de l’offre" description="Impossible d’afficher cette offre pour le moment." />
        <ErrorBox
          title="Offre indisponible"
          message={error}
          impact="Aucune donnée n’a été modifiée."
          onRetry={/^\d+$/.test(id) ? () => setReloadKey((value) => value + 1) : undefined}
        />
      </>
    );
  }

  if (job === null) {
    return <Loading />;
  }

  return <OfferEditorialDetail job={job} />;
}
