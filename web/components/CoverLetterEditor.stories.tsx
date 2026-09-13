import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CoverLetterEditor } from './CoverLetterEditor';

const generatedLetter = `Madame, Monsieur,\n\nVotre offre de Développeur Symfony / React correspond directement à mon expérience sur des produits web exigeants. J’ai travaillé sur des applications Symfony, React et PostgreSQL en mettant l’accent sur la qualité, l’accessibilité et la fiabilité.\n\nJe serais heureux d’échanger avec vous sur vos enjeux et la façon dont je peux contribuer à l’équipe.\n\nCordialement,`;

const longLetter = `${generatedLetter}\n\nJe peux également contribuer à la modernisation progressive d’applications existantes, à la mise en place de tests automatisés et à l’amélioration de l’expérience développeur. Sur mes dernières missions, j’ai travaillé avec des équipes produit pluridisciplinaires, des contraintes de performance fortes et des parcours utilisateurs nécessitant une attention particulière à la lisibilité des états, aux erreurs récupérables et aux comportements responsive.\n\nMa disponibilité est immédiate et je serais ravi de détailler ces expériences lors d’un échange.`;

const meta = {
  title: 'Applications/CoverLetterEditor',
  component: CoverLetterEditor,
  parameters: {
    layout: 'padded',
  },
  args: {
    value: generatedLetter,
    onChange: () => undefined,
    onCopy: () => undefined,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CoverLetterEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GeneratedLetter: Story = {};

export const NoLetterRequested: Story = {
  args: {
    value: '',
  },
};

export const ManualEntry: Story = {
  args: {
    value: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Ajouter une lettre manuellement' }));
    await expect(canvas.getByRole('textbox', { name: 'Lettre de motivation' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Copier la lettre' })).toBeDisabled();
  },
};

export const LongLetter: Story = {
  args: {
    value: longLetter,
  },
};
