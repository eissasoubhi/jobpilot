import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Shell } from './Shell';

const meta = {
  title: 'Layout/Application Shell',
  component: Shell,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
} satisfies Meta<typeof Shell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DashboardActive: Story = {
  args: {
    children: (
      <div>
        <div className="page-header">
          <div>
            <h1>Tableau de bord</h1>
            <p>Les actions prioritaires et l’état de ta recherche en un coup d’œil.</p>
          </div>
        </div>
        <div className="grid cols-3">
          <section className="card stat-card"><span>Offres qualifiées</span><strong>18</strong></section>
          <section className="card stat-card"><span>Candidatures envoyées</span><strong>7</strong></section>
          <section className="card stat-card"><span>Entretiens</span><strong>2</strong></section>
        </div>
      </div>
    ),
  },
};

export const OffersActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/offres',
      },
    },
  },
  args: {
    children: (
      <div>
        <div className="page-header">
          <div>
            <h1>Offres</h1>
            <p>Compare, filtre et priorise les opportunités qui correspondent à tes critères.</p>
          </div>
        </div>
        <section className="card">
          <span className="badge blue">84 % compatible</span>
          <h2>Senior Full-Stack Symfony / React</h2>
          <p className="muted">Paris · Freelance · Hybride</p>
        </section>
      </div>
    ),
  },
};
