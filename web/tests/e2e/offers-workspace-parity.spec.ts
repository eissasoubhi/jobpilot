import { expect, test, type Page } from '@playwright/test';

function watchForBrowserFailures(page: Page): string[] {
  const failures: string[] = [];

  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 500) failures.push(`http ${response.status()}: ${response.url()}`);
  });

  return failures;
}

test('Offers workspace covers preparation, review, manual submission tracking and safe Undo', async ({ page }, testInfo) => {
  const failures = watchForBrowserFailures(page);
  const uniqueSuffix = `offers-${testInfo.workerIndex}-${Date.now()}-${testInfo.retry}`;
  const cvName = `CV Offers parity ${uniqueSuffix}`;
  const jobTitle = `Senior Symfony Offers ${uniqueSuffix}`;
  const sourceUrl = `https://example.test/offers/${uniqueSuffix}`;

  await page.goto('/cv');
  await page.getByLabel('Nom du CV').fill(cvName);
  await page.getByLabel('Tags').fill('Symfony, PHP, API Platform');
  await page.getByLabel('Fichier PDF ou Word').setInputFiles({
    name: `cv-${uniqueSuffix}.pdf`,
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n% JobPilot Offers parity CV\n'),
  });
  await page.getByLabel('CV par défaut pour cette langue').check();
  await page.getByRole('button', { name: 'Téléverser' }).click();
  await expect(page.getByRole('heading', { name: cvName, level: 3, exact: true })).toBeVisible();

  await page.goto('/offres');
  await page.getByRole('button', { name: 'Ajouter une offre' }).click();
  const addDialog = page.getByRole('dialog', { name: 'Ajouter une offre' });
  await addDialog.getByLabel('Source', { exact: true }).fill(`Parity ${uniqueSuffix}`);
  await addDialog.getByLabel('URL').fill(sourceUrl);
  await addDialog.getByLabel('Intitulé').fill(jobTitle);
  await addDialog.getByLabel('Entreprise').fill('Parity Company');
  await addDialog.getByLabel('Lieu').fill('Paris');
  await addDialog.getByLabel('Contrat').selectOption({ label: 'Freelance' });
  await addDialog.getByLabel('TJM minimum').fill('480');
  await addDialog.getByLabel('TJM maximum').fill('600');
  await addDialog.getByLabel('Description').fill('Mission senior PHP Symfony API Platform Docker avec responsabilité backend.');
  await addDialog.getByRole('button', { name: 'Analyser et enregistrer' }).click();

  const jobHeading = page.getByRole('heading', { name: jobTitle, level: 3, exact: true });
  await expect(jobHeading).toBeVisible();
  const jobRow = page.getByRole('listitem').filter({ has: jobHeading });
  await expect(jobRow.getByText('Candidature')).toBeVisible();
  await expect(jobRow.getByText('CV prêt')).toBeVisible();
  await expect(jobRow.getByText('Message prêt')).toBeVisible();
  await expect(jobRow.getByText('Lettre prête')).toBeVisible();
  await expect(jobRow.getByText('Rémunération prête')).toBeVisible();

  await jobRow.getByRole('button', { name: 'Examiner' }).click();
  const reviewDialog = page.getByRole('dialog', { name: jobTitle });
  await expect(reviewDialog).toBeVisible();
  await expect(reviewDialog.getByText('Pourquoi ce score ?')).toBeVisible();
  await expect(reviewDialog.getByRole('textbox', { name: 'Message préparé' })).not.toHaveValue('');
  await expect(reviewDialog.getByRole('textbox', { name: 'Lettre de motivation demandée' })).not.toHaveValue('');
  await expect(reviewDialog.getByRole('textbox', { name: 'Réponse rémunération' })).toHaveValue('TJM proposé : 500 €');
  await expect(reviewDialog.getByRole('link', { name: 'Ouvrir la plateforme pour postuler' })).toHaveAttribute('href', sourceUrl);

  await reviewDialog.getByLabel('Confirmation / référence après envoi').fill(`CONF-${uniqueSuffix}`);
  await reviewDialog.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  await expect(reviewDialog.getByRole('status')).toContainText('Modifications enregistrées dans JobPilot.');

  await reviewDialog.getByRole('button', { name: 'J’ai envoyé la candidature' }).click();
  const submittedFeedback = reviewDialog.getByRole('status');
  await expect(submittedFeedback).toContainText('Candidature marquée comme envoyée');
  await expect(reviewDialog.getByRole('button', { name: 'Candidature déjà marquée comme envoyée' })).toBeDisabled();
  await expect(reviewDialog.getByRole('button', { name: 'Annuler la décision' })).toBeVisible();

  await reviewDialog.getByRole('button', { name: 'Annuler la décision' }).click();
  await expect(reviewDialog.getByRole('status')).toContainText('Dernière décision annulée');
  await expect(reviewDialog.getByRole('button', { name: 'J’ai envoyé la candidature' })).toBeEnabled();

  expect(failures).toEqual([]);
});
