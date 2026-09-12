import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogResetPanel } from '@/components/CatalogResetPanel';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));

vi.mock('@/lib/api', () => ({ api: apiMock }));

describe('CatalogResetPanel', () => {
  beforeEach(() => {
    apiMock.mockReset();
    vi.restoreAllMocks();
  });

  it('keeps the destructive action locked until the explicit phrase is entered', () => {
    render(<CatalogResetPanel />);

    const button = screen.getByRole('button', { name: 'Supprimer et resynchroniser' });
    const input = screen.getByRole('textbox', { name: 'Confirmation de réinitialisation des offres' });

    expect(button).toBeDisabled();
    fireEvent.change(input, { target: { value: 'reset' } });
    expect(button).toBeDisabled();
    fireEvent.change(input, { target: { value: 'REINITIALISER' } });
    expect(button).toBeEnabled();
  });

  it('shows an accessible final confirmation before resetting the catalog', async () => {
    apiMock.mockResolvedValueOnce({
      message: 'Catalogue supprimé puis resynchronisé depuis les sources actives.',
      reset: {
        busy: false,
        deletedOffers: 240,
        deletedApplications: 90,
        deletedOccurrences: 265,
      },
      sync: {
        received: 130,
        imported: 82,
        merged: 4,
        profileFiltered: 44,
        failed: 0,
        busy: false,
        skipped: false,
      },
    });

    render(<CatalogResetPanel />);
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Confirmation de réinitialisation des offres' }),
      { target: { value: 'REINITIALISER' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer et resynchroniser' }));

    const dialog = screen.getByRole('dialog', {
      name: 'Supprimer le catalogue et les candidatures liées ?',
    });
    expect(dialog).toHaveTextContent('historique de statuts');
    expect(apiMock).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Supprimer et resynchroniser' }));

    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/job-search/reset', {
      method: 'POST',
      body: JSON.stringify({ confirmation: 'RESET_OFFERS' }),
    }));

    expect(await screen.findByRole('status')).toHaveTextContent('240 offres supprimées');
    expect(screen.getByRole('status')).toHaveTextContent('90 candidatures supprimées');
    expect(screen.getByRole('status')).toHaveTextContent('82 nouvelles offres');
    expect(screen.getByRole('status')).toHaveTextContent('44 hors profil filtrées');
    expect(screen.getByRole('link', { name: 'Voir le nouveau catalogue →' })).toHaveAttribute('href', '/offres');
  });

  it('cancels the final confirmation without calling the reset API', () => {
    render(<CatalogResetPanel />);
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Confirmation de réinitialisation des offres' }),
      { target: { value: 'REINITIALISER' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer et resynchroniser' }));
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(apiMock).not.toHaveBeenCalled();
  });
});