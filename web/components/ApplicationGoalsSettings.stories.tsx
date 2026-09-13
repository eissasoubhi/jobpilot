import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ApplicationGoalsSettingsView } from './ApplicationGoalsSettings';

const meta = {
  title: 'Applications/ApplicationGoalsSettings',
  component: ApplicationGoalsSettingsView,
  tags: ['autodocs'],
  args: {
    draft: { daily: '3', weekly: '15', monthly: '60' },
    onDraftChange: () => undefined,
    onSubmit: (event) => event.preventDefault(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'États visuels du réglage des objectifs de candidatures. Le composant de présentation réutilise les primitives Card, FormField, Button, ErrorBox, InlineFeedback et Skeleton sans modifier les règles de cadence ni les appels API.',
      },
    },
  },
} satisfies Meta<typeof ApplicationGoalsSettingsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Configured: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Saving: Story = {
  args: {
    saving: true,
  },
};

export const Saved: Story = {
  args: {
    saved: true,
  },
};

export const LoadError: Story = {
  args: {
    draft: { daily: '0', weekly: '0', monthly: '0' },
    error: 'Impossible de charger les objectifs de candidatures.',
  },
};

export const DisabledCadences: Story = {
  args: {
    draft: { daily: '0', weekly: '0', monthly: '0' },
  },
};
