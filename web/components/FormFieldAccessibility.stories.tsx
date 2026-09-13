import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { FormField } from './UI';

const meta = {
  title: 'Design System/Form field accessibility',
  parameters: {
    docs: {
      description: {
        component:
          'Accessibility contracts for JobPilot form fields. Labels stay associated with controls, contextual messages are referenced with aria-describedby, and validation errors expose aria-invalid without hiding useful hints.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const HintAndSuccessDescriptions: Story = {
  name: 'Hint and success descriptions',
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 520 }}>
      <FormField
        label="Profil LinkedIn"
        hint="Ajoutez une URL publique que JobPilot peut réutiliser dans vos informations de candidature."
        success="Lien vérifié."
      >
        <input type="url" defaultValue="https://www.linkedin.com/in/example" />
      </FormField>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Profil LinkedIn' });
    const hint = canvas.getByText('Ajoutez une URL publique que JobPilot peut réutiliser dans vos informations de candidature.');
    const success = canvas.getByRole('status');
    const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? [];

    await expect(input).toHaveAccessibleName('Profil LinkedIn');
    await expect(describedBy).toContain(hint.id);
    await expect(describedBy).toContain(success.id);
    await expect(success).toHaveAttribute('aria-live', 'polite');
    await expect(success).toHaveTextContent('Lien vérifié.');
  },
};

export const ErrorKeepsHintAndMarksInvalid: Story = {
  name: 'Error keeps hint and marks invalid',
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 520 }}>
      <FormField
        label="E-mail de contact"
        hint="Utilisé uniquement pour préparer vos candidatures."
        error="Saisissez une adresse e-mail valide."
        success="Adresse vérifiée."
      >
        <input type="email" defaultValue="adresse-invalide" />
      </FormField>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'E-mail de contact' });
    const hint = canvas.getByText('Utilisé uniquement pour préparer vos candidatures.');
    const error = canvas.getByRole('alert');
    const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? [];

    await expect(input).toHaveAccessibleName('E-mail de contact');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(describedBy).toContain(hint.id);
    await expect(describedBy).toContain(error.id);
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await expect(error).toHaveTextContent('Saisissez une adresse e-mail valide.');
  },
};

export const PreservesExplicitControlMetadata: Story = {
  name: 'Preserves explicit control metadata',
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: 520 }}>
      <span id="external-help">Format attendu : ville ou zone de mobilité.</span>
      <FormField label="Localisation" hint="Vous pourrez la modifier plus tard.">
        <input id="profile-location" aria-describedby="external-help" defaultValue="Cergy, Île-de-France" />
      </FormField>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Localisation' });
    const hint = canvas.getByText('Vous pourrez la modifier plus tard.');
    const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? [];

    await expect(input).toHaveAttribute('id', 'profile-location');
    await expect(describedBy).toContain('external-help');
    await expect(describedBy).toContain(hint.id);
  },
};

export const LongContentPressure: Story = {
  name: 'Long content pressure',
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <FormField
        label="Intitulé recherché principal"
        hint="Décrivez le poste que vous ciblez avec suffisamment de précision pour distinguer votre métier principal des technologies secondaires ou simplement appréciées."
      >
        <input defaultValue="Senior Full-Stack PHP Symfony React / Next.js — plateformes métier, e-commerce et produits à forte volumétrie" />
      </FormField>
    </div>
  ),
};
