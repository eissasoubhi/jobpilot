import { expect, test } from '@playwright/test';

import type { CrmFollowUpTask } from '@/lib/crm-follow-ups';

test('CRM follow-up page creates and completes a local reminder for an explicit opportunity', async ({ page }) => {
  const organization = {
    key: 'acme', name: 'Acme', sourceName: 'Acme', roles: ['COMPANY'], offerCount: 1,
    applicationCount: 0, positioningCount: 0, messageCount: 0, contactCount: 1,
    applicationStatuses: {}, positioningStatuses: {},
    latestOffers: [{ id: 42, title: 'Senior PHP Engineer', status: 'NEW', score: 91, sourceUrl: null }],
    contacts: [{ key: 'jane@acme.test', name: 'Jane', email: 'jane@acme.test', phone: null, roles: ['RECRUITER'], messageCount: 0 }],
  };
  let tasks: CrmFollowUpTask[] = [{
    id: 1, organizationKey: 'acme', contactKey: 'jane@acme.test', jobOfferId: 42, title: 'Relancer Jane', note: null,
    dueAt: '2026-08-07', completed: false, completedAt: null,
    createdAt: '2026-08-06T08:00:00+02:00', updatedAt: '2026-08-06T08:00:00+02:00',
  }];
  let createdPayload: unknown = null;

  await page.route('**/api/crm/organizations', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ generatedAt: '', organizationCount: 1, contactCount: 1, annotationCount: 0, organizations: [organization] }) }));
  await page.route('**/api/crm/follow-ups?status=*', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tasks) }));
  await page.route('**/api/crm/organizations/acme/follow-ups', async (route) => {
    createdPayload = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 2, ...createdPayload as object, organizationKey: 'acme', completed: false, createdAt: '', updatedAt: '' }) });
  });
  await page.route('**/api/crm/follow-ups/1', async (route) => {
    tasks = [{ ...tasks[0], completed: true, completedAt: '2026-08-06T09:00:00+02:00' }];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tasks[0]) });
  });

  await page.goto('/crm/follow-ups');
  await expect(page.getByRole('heading', { name: 'Relances CRM', level: 1 })).toBeVisible();
  await expect(page.getByText('Relancer Jane')).toBeVisible();
  await expect(page.getByText(/Senior PHP Engineer/)).toBeVisible();

  await page.getByLabel('Organisation', { exact: true }).selectOption('acme');
  await page.getByLabel('Contact facultatif', { exact: true }).selectOption('jane@acme.test');
  await page.getByLabel('Opportunité facultative', { exact: true }).selectOption('42');
  await page.getByLabel('Date de relance', { exact: true }).fill('2026-08-12');
  await page.getByLabel('Titre', { exact: true }).fill('Demander une décision');
  await page.getByRole('button', { name: 'Créer la relance' }).click();
  await expect.poll(() => createdPayload).toEqual({ contactKey: 'jane@acme.test', jobOfferId: 42, title: 'Demander une décision', note: '', dueAt: '2026-08-12' });
  await expect(page.getByText('La tâche de relance a été créée.')).toBeVisible();

  await page.getByRole('button', { name: 'Marquer terminée' }).click();
  await expect(page.getByText('La relance est terminée.')).toBeVisible();
});
