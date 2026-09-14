import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button, DataList, DataListItem, DataToolbar } from './UI';

const meta = {
  title: 'Data/DataList',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Shared JobPilot pattern for compact operational lists. DataToolbar keeps context and actions together while DataList and DataListItem preserve native list semantics for fast scanning and assistive technology.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const OperationalList: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <DataToolbar
        aria-label="Actions des candidatures"
        actions={<Button size="small">Actualiser</Button>}
      >
        <div>
          <strong>Candidatures</strong>
          <div>3 éléments à examiner</div>
        </div>
      </DataToolbar>
      <DataList aria-label="Candidatures à examiner" style={{ marginTop: '1rem' }}>
        <DataListItem>
          <strong>Senior PHP / Symfony</strong>
          <div>Entreprise Alpha · Paris</div>
        </DataListItem>
        <DataListItem>
          <strong>Full-stack React / PHP</strong>
          <div>Entreprise Beta · Remote</div>
        </DataListItem>
        <DataListItem>
          <strong>Software Engineer</strong>
          <div>Entreprise Gamma · Hybride</div>
        </DataListItem>
      </DataList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Candidatures à examiner' });
    const items = within(list).getAllByRole('listitem');
    const action = canvas.getByRole('button', { name: 'Actualiser' });

    await expect(items).toHaveLength(3);
    await expect(items[0]).toHaveTextContent('Senior PHP / Symfony');
    await userEvent.tab();
    await expect(action).toHaveFocus();
  },
};

export const ReadOnlyList: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <DataToolbar>
        <div>
          <strong>Historique récent</strong>
          <div>Aucune action disponible dans cette vue.</div>
        </div>
      </DataToolbar>
      <DataList aria-label="Historique récent" style={{ marginTop: '1rem' }}>
        <DataListItem>Synchronisation Gmail terminée</DataListItem>
        <DataListItem>12 offres normalisées</DataListItem>
      </DataList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('list', { name: 'Historique récent' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const LongContentMobile: Story = {
  name: 'Long content · mobile',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div>
      <DataToolbar actions={<Button size="small" variant="secondary">Réexaminer</Button>}>
        <div>
          <strong>Candidatures nécessitant une vérification</strong>
          <div>Le contenu reste lisible sans transformer les actions secondaires en action principale.</div>
        </div>
      </DataToolbar>
      <DataList aria-label="Candidatures nécessitant une vérification" style={{ marginTop: '1rem' }}>
        <DataListItem>
          <strong>Senior Full-stack Symfony React pour une plateforme européenne de services professionnels</strong>
          <div>Entreprise au nom volontairement long · Paris / hybride · source recruteur</div>
        </DataListItem>
        <DataListItem>
          <strong>Développeur PHP expérimenté pour modernisation progressive d’un système métier historique</strong>
          <div>Organisation avec plusieurs entités · Île-de-France · informations partielles</div>
        </DataListItem>
      </DataList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('list', { name: 'Candidatures nécessitant une vérification' }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getByRole('button', { name: 'Réexaminer' })).toBeInTheDocument();
  },
};
