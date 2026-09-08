'use client';

import { useEffect } from 'react';

import { ErrorBox, PageHeader } from '@/components/UI';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <PageHeader
        title="Impossible d’afficher cette page"
        description="JobPilot a rencontré un problème inattendu. Vous pouvez réessayer sans perdre les données déjà enregistrées."
      />
      <ErrorBox
        title="La page n’a pas pu être chargée"
        message="Une erreur inattendue empêche l’affichage de cette page."
        impact="Les données déjà enregistrées dans JobPilot ne sont pas modifiées."
        details={error.message || undefined}
        onRetry={reset}
      />
    </>
  );
}
