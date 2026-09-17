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
  await page.getByRole('button', { name: 'Ajouter le CV' }).click();
  await expect(page.getByText(cvName, { exact: true })).toBeVisible();

  const createdOffer = await page.request.post('/api/job-offers', {
    data: {
      title: jobTitle,
      company: `Acme Offers ${uniqueSuffix}`,
      location: 'Paris',
      description: 'Mission Symfony senior avec API Platform. Une lettre de motivation est demandée. Merci de préciser vos prétentions salariales.',
      source: 'MANUAL',
      sourceUrl,
      workMode: 'HYBRID',
      contractType: 'FREELANCE',
      salaryMin: 500,
      salaryMax: 550,
      salaryCurrency: 'EUR',
      salaryPeriod: 'DAY',
    },
  });
  expect(createdOffer.ok()).toBeTruthy();

  await page.goto('/offres');
  const offerCard = page.locator('article').filter({ hasText: jobTitle });
  await expect(offerCard).toBeVisible();
  await offerCard.getByRole('button', { name: 'Préparer la candidature' }).click();

  await expect(offerCard.getByText('Candidature', { exact: true })).toBeVisible();
  await expect(offerCard.getByText(cvName, { exact: true })).toBeVisible();
  await expect(offerCard.getByText('Message préparé')).toBeVisible();
  await expect(offerCard.getByText('Lettre de motivation demandée')).toBeVisible();
  await expect(offerCard.getByText('500 € HT/jour')).toBeVisible();

  await offerCard.getByRole('button', { name: 'Examiner' }).click();
  let reviewDialog = page.getByRole('dialog');
  await expect(reviewDialog).toBeVisible();
  await expect(reviewDialog.getByRole('heading', { name: jobTitle })).toBeVisible();
  await expect(reviewDialog.getByText('Message de candidature')).toBeVisible();
  await expect(reviewDialog.getByText('Lettre de motivation')).toBeVisible();
  await expect(reviewDialog.getByText('500 € HT/jour')).toBeVisible();
  await expect(reviewDialog.getByRole('link', { name: 'Ouvrir la plateforme pour postuler' })).toHaveAttribute('href', sourceUrl);

  const messageField = reviewDialog.getByLabel('Message de candidature');
  await messageField.fill(`Message Offers parity ${uniqueSuffix}`);
  await reviewDialog.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  await expect(page.getByRole('status')).toContainText('Modifications enregistrées');

  await reviewDialog.getByRole('button', { name: 'J’ai envoyé la candidature' }).click();
  await expect(page.getByRole('status')).toContainText('Candidature marquée comme envoyée');
  reviewDialog = page.getByRole('dialog');
  await expect(reviewDialog.getByText('SUBMITTED', { exact: true })).toBeVisible();
  await expect(reviewDialog.getByRole('button', { name: 'Annuler la dernière décision' })).toBeVisible();

  await reviewDialog.getByRole('button', { name: 'Annuler la dernière décision' }).click();
  await expect(page.getByRole('status')).toContainText('Dernière décision annulée');
  reviewDialog = page.getByRole('dialog');
  await expect(reviewDialog.getByText('REVIEW', { exact: true })).toBeVisible();
  await expect(reviewDialog.getByRole('button', { name: 'Annuler la dernière décision' })).toHaveCount(0);

  expect(failures).toEqual([]);
});
