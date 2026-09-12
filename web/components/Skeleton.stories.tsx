import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Card, DataList, DataListItem, DataToolbar } from './UI';
import { Skeleton, SkeletonGroup } from './Skeleton';

const meta = {
  title: 'Feedback/Skeleton',
  component: SkeletonGroup,
  parameters: {
    docs: {
      description: {
        component:
          'Accessible loading placeholders for JobPilot. SkeletonGroup exposes one polite busy status for the region while individual Skeleton shapes stay hidden from assistive technologies.',
      },
    },
  },
} satisfies Meta<typeof SkeletonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    label: 'Chargement du contenu',
    children: (
      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 520 }}>
        <Skeleton width="55%" height={24} />
        <Skeleton width="100%" />
        <Skeleton width="82%" />
      </div>
    ),
  },
};

export const CardLoading: Story = {
  name: 'Card loading',
  args: {
    label: 'Chargement du résumé',
    children: (
      <Card>
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 620 }}>
          <Skeleton width="42%" height={22} />
          <Skeleton width="100%" />
          <Skeleton width="88%" />
          <Skeleton width={120} height={36} />
        </div>
      </Card>
    ),
  },
};

export const DenseListLoading: Story = {
  name: 'Dense list loading',
  args: {
    label: 'Chargement des candidatures',
    children: (
      <Card>
        <DataToolbar>
          <div style={{ display: 'grid', gap: '0.4rem', width: '100%', maxWidth: 320 }}>
            <Skeleton width="48%" height={20} />
            <Skeleton width="72%" />
          </div>
        </DataToolbar>
        <DataList aria-label="Candidatures en cours de chargement" style={{ marginTop: '1rem' }}>
          {[0, 1, 2].map((item) => (
            <DataListItem key={item}>
              <div style={{ display: 'grid', gap: '0.45rem', width: '100%' }}>
                <Skeleton width="64%" height={18} />
                <Skeleton width="38%" />
              </div>
            </DataListItem>
          ))}
        </DataList>
      </Card>
    ),
  },
};
