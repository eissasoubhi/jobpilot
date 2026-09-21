import { expect, test, type Page } from '@playwright/test';

const principalWorkflows = [
  ['/offres', 'Offres'],
  ['/offres/review', 'Review Queue'],
  ['/messages', 'Messagerie'],
  ['/crm', 'CRM'],
  ['/reporting', 'Reporting candidatures'],
] as const;

async function expectAccessiblePageStructure(page: Page, heading: string): Promise<void> {
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: heading, level: 1 })).toHaveCount(1);

  const violations = await page.evaluate(() => {
    const visible = (element: HTMLElement): boolean => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };

    const accessibleName = (element: HTMLElement): string => {
      const ariaLabel = element.getAttribute('aria-label')?.trim();
      if (ariaLabel) return ariaLabel;

      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy) {
        const label = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
          .filter(Boolean)
          .join(' ');
        if (label) return label;
      }

      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
        if (element.labels?.length) {
          const label = Array.from(element.labels)
            .map((item) => item.textContent?.trim() ?? '')
            .filter(Boolean)
            .join(' ');
          if (label) return label;
        }
        if (element.getAttribute('title')?.trim()) return element.getAttribute('title')!.trim();
        if (element instanceof HTMLInputElement && element.type === 'hidden') return 'hidden';
      }

      if (element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement) {
        const text = element.textContent?.trim();
        if (text) return text;
        const title = element.getAttribute('title')?.trim();
        if (title) return title;
        const imageAlt = element.querySelector('img[alt]')?.getAttribute('alt')?.trim();
        if (imageAlt) return imageAlt;
      }

      return '';
    };

    const unnamedInteractive = Array.from(
      document.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea'),
    )
      .filter(visible)
      .filter((element) => accessibleName(element) === '')
      .map((element) => `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`);

    const imagesWithoutAlt = Array.from(document.querySelectorAll<HTMLImageElement>('img'))
      .filter(visible)
      .filter((image) => !image.hasAttribute('alt'))
      .map((image) => image.currentSrc || image.src || '<inline image>');

    return { unnamedInteractive, imagesWithoutAlt };
  });

  expect(violations.unnamedInteractive, 'visible interactive controls must have an accessible name').toEqual([]);
  expect(violations.imagesWithoutAlt, 'visible images must declare alt text (empty alt is valid for decorative images)').toEqual([]);
}

async function expectLocalNavigationBudget(page: Page): Promise<void> {
  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (!navigation) return null;
    return {
      domContentLoadedMs: navigation.domContentLoadedEventEnd,
      loadMs: navigation.loadEventEnd,
    };
  });

  expect(timing, 'navigation timing must be available for V1 workflow measurement').not.toBeNull();
  expect(timing?.domContentLoadedMs ?? Number.POSITIVE_INFINITY).toBeLessThan(5_000);
  expect(timing?.loadMs ?? Number.POSITIVE_INFINITY).toBeLessThan(8_000);
}

test.describe('V1 principal workflow quality evidence', () => {
  for (const [route, heading] of principalWorkflows) {
    test(`${heading} keeps measurable accessibility semantics and local performance budgets`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'load' });
      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();

      await expectAccessiblePageStructure(page, heading);
      await expectLocalNavigationBudget(page);
    });
  }
});
