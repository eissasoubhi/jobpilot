import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Empty, ErrorBox, InlineFeedback } from './UI';

const meta = {
  title: 'Design System/Feedback accessibility',
  parameters: {
    docs: {
      description: {
        component:
          'Accessibility contracts for JobPilot shared feedback primitives. Status updates stay polite by default, blocking feedback is announced immediately, and technical detail remains progressively disclosed.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StatusAndAlertSemantics: Story = {
  name: 'Status and alert semantics',
  render: () => (
    <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 720 }}>
      <InlineFeedback>Synchronisation terminée sans changement.</InlineFeedback>
      <InlineFeedback tone="success">Préférences enregistrées.</InlineFeedback>
      <InlineFeedback tone="warning">
        Deux candidatures demandent une vérification avant le prochain envoi.
      </InlineFeedback>
      <InlineFeedback role="alert" tone="warning">
        La connexion au connecteur a expiré. Reconnectez-le avant de relancer la synchronisation.
      </InlineFeedback>
      <Empty>Aucun élément ne correspond aux filtres actuels.</Empty>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const statuses = canvas.getAllByRole('status');
    const alert = canvas.getByRole('alert');

    await expect(statuses).toHaveLength(4);
    for (const status of statuses) {
      await expect(status).toHaveAttribute('aria-live', 'polite');
    }
    await expect(alert).toHaveAttribute('aria-live', 'assertive');
    await expect(alert).toHaveTextContent('connexion au connecteur a expiré');
  },
};

export const RecoverableErrorDisclosure: Story = {
  name: 'Recoverable error disclosure',
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <ErrorBox
        title="Synchronisation interrompue"
        message="Les nouvelles offres n’ont pas pu être récupérées. Les données déjà enregistrées restent disponibles."
        impact="Aucune candidature ni offre existante n’a été modifiée."
        details="Le service distant a dépassé le délai de réponse après plusieurs tentatives. Vérifiez le connecteur avant de réessayer."
        retryLabel="Relancer la synchronisation"
        onRetry={() => undefined}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    const details = canvas.getByText('Voir le diagnostic').closest('details');

    await expect(alert).toHaveTextContent('Synchronisation interrompue');
    await expect(alert).toHaveTextContent('Aucune candidature ni offre existante n’a été modifiée.');
    await expect(canvas.getByRole('button', { name: 'Relancer la synchronisation' })).toBeEnabled();
    await expect(details).not.toHaveAttribute('open');

    await userEvent.click(canvas.getByText('Voir le diagnostic'));

    await expect(details).toHaveAttribute('open');
    await expect(alert).toHaveTextContent('Le service distant a dépassé le délai de réponse');
  },
};

export const LongFeedbackPressure: Story = {
  name: 'Long feedback pressure',
  render: () => (
    <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
      <InlineFeedback tone="warning">
        La synchronisation a terminé avec plusieurs avertissements : certaines offres contiennent un intitulé très long,
        des informations de localisation incomplètes et des métadonnées de source qui nécessitent une vérification
        manuelle avant d’être utilisées pour une décision de candidature.
      </InlineFeedback>
      <Empty>
        Aucun résultat exploitable pour cette combinaison de filtres, de localisation, de type de contrat et de score
        minimum. Modifiez les critères pour élargir la recherche.
      </Empty>
    </div>
  ),
};
