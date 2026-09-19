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

test('Offers workspace covers preparation, review, archive recovery, manual submission tracking and safe Undo', async ({ page }, testInfo) => {
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
  await page.getByRole('button', { name: 'Téléverser' }).click();
  await expect(page.getByText(cvName, { exact: true })).toBeVisible();

  await page.goto('/offres');
  await page.getByRole('button', { name: 'Ajouter une offre' }).click();
  const addDialog = page.getByRole('dialog', { name: 'Ajouter une offre' });
  await addDialog.getByLabel('Source', { exact: true }).fill(`Manual parity ${uniqueSuffix}`);
  await addDialog.getByLabel('URL').fill(sourceUrl);
  await addDialog.getByLabel('Intitulé').fill(jobTitle);
  await addDialog.getByLabel('Entreprise').fill(`Acme Offers ${uniqueSuffix}`);
  await addDialog.getByLabel('Lieu').fill('Paris');
  await addDialog.getByLabel('Contrat').selectOption({ label: 'Freelance' });
  await addDialog.getByLabel('TJM minimum').fill('500');
  await addDialog.getByLabel('TJM maximum').fill('550');
  await addDialog
    .getByLabel('Description')
    .fill('Mission Symfony senior avec API Platform. Une lettre de motivation est demandée. Merci de préciser vos prétentions salariales.');
  await addDialog.getByRole('button', { name: 'Analyser et enregistrer' }).click();

  const offerCard = page.getByRole('listitem').filter({ hasText: jobTitle });
  await expect(offerCard).toBeVisible();
  await expect(offerCard.getByRole('strong').filter({ hasText: cvName })).toBeVisible();

  const preparedApplication = offerCard.getByRole('region', { name: `Candidature préparée pour ${jobTitle}` });
  await expect(preparedApplication.getByText('Candidature', { exact: true })).toBeVisible();
  await expect(preparedApplication.getByText('CV prêt', { exact: true })).toBeVisible();
  await expect(preparedApplication.getByText('Message prêt', { exact: true })).toBeVisible();
  await expect(preparedApplication.getByText('Lettre prête', { exact: true })).toBeVisible();
  await expect(preparedApplication.getByText('Rémunération prête', { exact: true })).toBeVisible();

  await offerCard.getByRole('button', { name: 'Examiner' }).click();
  let reviewDialog = page.getByRole('dialog');
  await expect(reviewDialog).toBeVisible();
  await expect(reviewDialog.getByRole('heading', { name: jobTitle })).toBeVisible();
  await expect(reviewDialog.getByLabel('Message préparé')).toBeVisible();
  await expect(reviewDialog.getByLabel('Lettre de motivation demandée')).toBeVisible();
  await expect(reviewDialog.getByLabel('Réponse rémunération')).toHaveValue('500 € HT/jour');
  await expect(reviewDialog.getByRole('link', { name: 'Ouvrir la plateforme pour postuler' })).toHaveAttribute('href', sourceUrl);

  const messageField = reviewDialog.getByLabel('Message préparé');
  await messageField.fill(`Message Offers parity ${uniqueSuffix}`);
  await reviewDialog.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  await expect(reviewDialog.getByRole('status')).toContainText('Modifications enregistrées');

  await reviewDialog.getByRole('button', { name: 'Archiver' }).click();
  await expect(reviewDialog.getByRole('status')).toContainText('Offre archivée dans JobPilot');
  await reviewDialog.getByRole('button', { name: 'Fermer' }).click();
  await expect(offerCard).toHaveCount(0);

  await page.getByRole('radio', { name: 'Archivées' }).click();
  const archivedOfferCard = page.getByRole('listitem').filter({ hasText: jobTitle });
  await expect(archivedOfferCard).toBeVisible();
  await archivedOfferCard.getByRole('button', { name: 'Examiner' }).click();

  reviewDialog = page.getByRole('dialog');
  await expect(reviewDialog.getByRole('button', { name: 'Annuler la décision' })).toBeVisible();
  await reviewDialog.getByRole('button', { name: 'Annuler la décision' }).click();
  await reviewDialog.getByRole('button', { name: 'Fermer' }).click();
  await expect(archivedOfferCard).toHaveCount(0);

  await page.getByRole('radio', { name: 'À traiter' }).click();
  const restoredAfterArchiveCard = page.getByRole('listitem').filter({ hasText: jobTitle });
  await expect(restoredAfterArchiveCard).toBeVisible();
  await restoredAfterArchiveCard.getByRole('button', { name: 'Examiner' }).click();

  reviewDialog = page.getByRole('dialog');
  await reviewDialog.getByRole('button', { name: 'J’ai envoyé la candidature' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(restoredAfterArchiveCard).toHaveCount(0);

  await page.getByRole('radio', { name: 'Envoyées' }).click();
  const submittedOfferCard = page.getByRole('listitem').filter({ hasText: jobTitle });
  await expect(submittedOfferCard).toBeVisible();
  await submittedOfferCard.getByRole('button', { name: 'Examiner' }).click();

  reviewDialog = page.getByRole('dialog');
  await expect(reviewDialog).toBeVisible();
  await expect(reviewDialog.getByRole('button', { name: 'Annuler la décision' })).toBeVisible();

  await reviewDialog.getByRole('button', { name: 'Annuler la décision' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(submittedOfferCard).toHaveCount(0);

  await page.getByRole('radio', { name: 'À traiter' }).click();
  const restoredOfferCard = page.getByRole('listitem').filter({ hasText: jobTitle });
  await expect(restoredOfferCard).toBeVisible();

  expect(failures).toEqual([]);
});
