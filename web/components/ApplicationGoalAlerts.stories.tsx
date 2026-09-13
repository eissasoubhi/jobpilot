import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import type { ApplicationGoalPeriod, ApplicationGoalSnapshot } from '@/lib/application-goals';

import { ApplicationGoalAlertsSummary } from './ApplicationGoalAlerts';

function period(
  value: Partial<ApplicationGoalPeriod> & Pick<ApplicationGoalPeriod, 'period' | 'label' | 'target' | 'achieved' | 'start' | 'end'>,
): ApplicationGoalPeriod {
  const remaining = Math.max(0, value.target - value.achieved);
  const percent = value.target === 0 ? 0 : Math.round((value.achieved / value.target) * 100);

  return {
    enabled: true,
    remaining,
    percent,
    completed: value.achieved >= value.target,
    ...value,
  };
}

const daily = period({
  period: 'daily',
  label: 'Aujourd’hui',
  target: 3,
  achieved: 1,
  start: '2026-09-13T00:00:00Z',
  end: '2026-09-14T00:00:00Z',
});

const baseSnapshot: ApplicationGoalSnapshot = {
  config: {
    daily: 3,
    weekly: 10,
    monthly: 30,
    timezone: 'Europe/Paris',
    startedAt: '2026-09-01T00:00:00+02:00',
  },
  periods: {
    daily,
    weekly: period({
      period: 'weekly',
      label: 'Cette semaine',
      target: 10,
      achieved: 8,
      start: '2026-09-07T00:00:00Z',
      end: '2026-09-14T00:00:00Z',
    }),
    monthly: period({
      period: 'monthly',
      label: 'Ce mois',
      target: 30,
      achieved: 20,
      start: '2026-09-01T00:00:00Z',
      end: '2026-10-01T00:00:00Z',
    }),
  },
  missed: [],
  generatedAt: '2026-09-13T12:00:00Z',
};

const missedWeekly: ApplicationGoalSnapshot = {
  ...baseSnapshot,
  periods: {
    ...baseSnapshot.periods,
    daily: { ...daily, completed: true, achieved: 3, remaining: 0, percent: 100 },
  },
  missed: [
    {
      period: 'weekly',
      label: 'Semaine précédente',
      target: 10,
      achieved: 7,
      remaining: 3,
      start: '2026-08-31T00:00:00Z',
      end: '2026-09-07T00:00:00Z',
    },
  ],
};

const denseAlertsSnapshot: ApplicationGoalSnapshot = {
  ...baseSnapshot,
  missed: [
    {
      period: 'weekly',
      label: 'Semaine précédente',
      target: 12,
      achieved: 7,
      remaining: 5,
      start: '2026-08-31T00:00:00Z',
      end: '2026-09-07T00:00:00Z',
    },
    {
      period: 'monthly',
      label: 'Mois précédent avec un objectif de candidatures plus ambitieux',
      target: 45,
      achieved: 31,
      remaining: 14,
      start: '2026-08-01T00:00:00Z',
      end: '2026-09-01T00:00:00Z',
    },
  ],
};

const meta = {
  title: 'Applications/Application goal alerts',
  component: ApplicationGoalAlertsSummary,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Alertes contextuelles d’objectifs de candidatures. Les états distinguent les objectifs manqués nécessitant de l’attention du rappel quotidien informatif, sans dupliquer le comportement métier.',
      },
    },
  },
  args: {
    snapshot: baseSnapshot,
  },
} satisfies Meta<typeof ApplicationGoalAlertsSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DailyReminder: Story = {};

export const MissedGoal: Story = {
  args: {
    snapshot: missedWeekly,
  },
};

export const MissedGoalAndDailyReminder: Story = {
  args: {
    snapshot: {
      ...baseSnapshot,
      missed: missedWeekly.missed,
    },
  },
};

export const SeveralMissedGoalsWithDailyReminder: Story = {
  name: 'Several missed goals with daily reminder',
  args: {
    snapshot: denseAlertsSnapshot,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'État dense avec plusieurs périodes manquées, un libellé long et le rappel quotidien actif afin de vérifier la hiérarchie attention/information et la pression de contenu réaliste.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Alertes d’objectifs de candidatures' });
    const alerts = within(region).getAllByRole('alert');
    const catchUpLinks = within(region).getAllByRole('link', { name: 'Rattraper dans la Review Queue →' });

    await expect(alerts).toHaveLength(2);
    await expect(catchUpLinks).toHaveLength(2);
    await expect(within(region).getByText(/Mois précédent avec un objectif de candidatures plus ambitieux/)).toBeVisible();
    await expect(within(region).getByText('Objectif du jour : 1 / 3')).toBeVisible();
    await expect(within(region).getByRole('link', { name: 'Continuer →' })).toBeVisible();
  },
};
