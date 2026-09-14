import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { FilterTabs } from '@/components/FilterTabs';

type ApplicationView = 'all' | 'actionable' | 'submitted';

const options = [
  { value: 'all', label: 'Toutes · 24' },
  { value: 'actionable', label: 'À traiter · 7' },
  { value: 'submitted', label: 'Envoyées · 17' },
] as const;

function ApplicationFilterTabs({ initialValue = 'all' }: { initialValue?: ApplicationView }) {
  const [value, setValue] = useState<ApplicationView>(initialValue);

  return (
    <FilterTabs
      ariaLabel="Filtrer les candidatures"
      options={options}
      value={value}
      onChange={setValue}
    />
  );
}

const meta = {
  title: 'Navigation/Filter tabs',
  component: ApplicationFilterTabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Filtre compact pour basculer entre vues d’une même liste. Le groupe garde un nom accessible, expose l’état sélectionné sans dépendre uniquement de la couleur et prend en charge les flèches, Home et End au clavier.',
      },
    },
  },
} satisfies Meta<typeof ApplicationFilterTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllApplications: Story = {
  args: {
    initialValue: 'all',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Filtrer les candidatures' });
    const radios = within(group).getAllByRole('radio');

    await expect(radios).toHaveLength(3);
    await expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    await expect(radios[0]).toHaveAttribute('tabindex', '0');
    await expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    await expect(radios[1]).toHaveAttribute('tabindex', '-1');
  },
};

export const ActionRequired: Story = {
  args: {
    initialValue: 'actionable',
  },
};

export const Submitted: Story = {
  args: {
    initialValue: 'submitted',
  },
};

export const KeyboardNavigation: Story = {
  name: 'Keyboard navigation and wrapping',
  args: {
    initialValue: 'all',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Filtrer les candidatures' });
    const getRadios = () => within(group).getAllByRole('radio');

    getRadios()[0].focus();
    await expect(getRadios()[0]).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(getRadios()[1]).toHaveFocus();
    await expect(getRadios()[1]).toHaveAttribute('aria-checked', 'true');
    await expect(getRadios()[1]).toHaveAttribute('tabindex', '0');

    await userEvent.keyboard('{End}');
    await expect(getRadios()[2]).toHaveFocus();
    await expect(getRadios()[2]).toHaveAttribute('aria-checked', 'true');

    await userEvent.keyboard('{ArrowRight}');
    await expect(getRadios()[0]).toHaveFocus();
    await expect(getRadios()[0]).toHaveAttribute('aria-checked', 'true');

    await userEvent.keyboard('{End}');
    await userEvent.keyboard('{Home}');
    await expect(getRadios()[0]).toHaveFocus();
    await expect(getRadios()[0]).toHaveAttribute('aria-checked', 'true');

    await userEvent.keyboard('{ArrowLeft}');
    await expect(getRadios()[2]).toHaveFocus();
    await expect(getRadios()[2]).toHaveAttribute('aria-checked', 'true');
  },
};
