import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useId, useRef, useState } from 'react';

import { Modal } from './Modal';
import { Button, FormField } from './UI';

const meta = {
  title: 'Feedback/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    ariaLabel: 'Détail de la candidature',
    onClose: () => undefined,
    children: null,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function LabelledModalExample({ closeOnBackdrop = true }: { closeOnBackdrop?: boolean }) {
  const [open, setOpen] = useState(true);
  const titleId = useId();
  const descriptionId = useId();
  const initialFocusRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ padding: 24 }}>
      {!open && <Button onClick={() => setOpen(true)}>Rouvrir le dialogue</Button>}
      {open && (
        <Modal
          ariaLabelledBy={titleId}
          ariaDescribedBy={descriptionId}
          closeOnBackdrop={closeOnBackdrop}
          initialFocusRef={initialFocusRef}
          onClose={() => setOpen(false)}
        >
          <div className="stack">
            <div>
              <h2 id={titleId} className="section-title">Préparer cette candidature</h2>
              <p id={descriptionId} className="muted">
                Vérifiez les informations avant de poursuivre. Rien n’est envoyé automatiquement.
              </p>
            </div>
            <FormField label="Note de préparation">
              <input ref={initialFocusRef} placeholder="Ajouter une note" />
            </FormField>
            <div className="actions">
              <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
              <Button>Continuer</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export const LabelledAndDescribed: Story = {
  render: () => <LabelledModalExample />,
};

export const BackdropLocked: Story = {
  render: () => <LabelledModalExample closeOnBackdrop={false} />,
};

export const DirectAccessibleLabel: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div style={{ padding: 24 }}>
        {!open && <Button onClick={() => setOpen(true)}>Rouvrir le dialogue</Button>}
        {open && (
          <Modal ariaLabel="Informations sur la synchronisation" onClose={() => setOpen(false)}>
            <div className="stack">
              <p className="muted">La synchronisation peut être fermée avec Échap ou ce bouton.</p>
              <div className="actions">
                <Button onClick={() => setOpen(false)}>Fermer</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  },
};
