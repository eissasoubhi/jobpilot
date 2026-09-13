import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
