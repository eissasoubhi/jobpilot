import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { MarketSkillsCard } from './MarketSkillsCard';

const marketSkills = {
  periodDays: 30,
  matchingThreshold: 60,
  analyzedJobs: 18,
  configuredSkillsCount: 12,
  demanded: [
    { label: 'Symfony', count: 12, coveragePercent: 66.7 },
    { label: 'React', count: 9, coveragePercent: 50 },
  ],
  matching: [
    { label: 'Symfony', count: 12, coveragePercent: 66.7 },
  ],
  unconfigured: [
    { label: 'Kubernetes', count: 4, coveragePercent: 22.2 },
  ],
};

const meta = {
  title: 'Dashboard/MarketSkillsCard',
  component: MarketSkillsCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MarketSkillsCard>;

export default meta;
type MarketSkillsStory = StoryObj<typeof meta>;

export const Loaded: MarketSkillsStory = {
  render: () => <MarketSkillsCard marketSkillsLoader={async () => marketSkills} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Symfony')).toBeInTheDocument();
    await expect(canvas.getByText('Kubernetes')).toBeInTheDocument();
  },
};

export const Empty: MarketSkillsStory = {
  render: () => <MarketSkillsCard marketSkillsLoader={async () => ({ ...marketSkills, analyzedJobs: 0, demanded: [], matching: [], unconfigured: [] })} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/Pas encore assez d’offres qualifiées/)).toBeInTheDocument();
  },
};

export const Loading: MarketSkillsStory = {
  render: () => <MarketSkillsCard marketSkillsLoader={() => new Promise(() => undefined)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent('Analyse des tendances…');
  },
};

export const Failure: MarketSkillsStory = {
  name: 'Error',
  render: () => <MarketSkillsCard marketSkillsLoader={async () => { throw new globalThis.Error('indisponible'); }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('alert')).toHaveTextContent('Les tendances de compétences ne sont pas disponibles pour le moment.');
  },
};
