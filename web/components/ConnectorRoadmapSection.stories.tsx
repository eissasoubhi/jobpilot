import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ConnectorRoadmapSection } from './ConnectorRoadmapSection';

const meta = {
  title: 'Synchronization/Connector roadmap section',
  component: ConnectorRoadmapSection,
  parameters: {
    docs: {
      description: {
        component:
          'Matrice informative des plateformes suivies par JobPilot. Elle distingue les connecteurs opérationnels, les canaux officiels planifiés, les sources restreintes et les sources encore en revue sans transformer ces états en contrôles exécutables.',
      },
    },
  },
} satisfies Meta<typeof ConnectorRoadmapSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoverageMatrix: Story = {};
