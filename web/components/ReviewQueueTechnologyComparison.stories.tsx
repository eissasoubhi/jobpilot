import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ReviewQueueTechnologyComparison } from './ReviewQueueTechnologyComparison';

const meta = {
  title: 'Applications/Review queue technology comparison',
  component: ReviewQueueTechnologyComparison,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Decision-first technical compatibility summary used in the JobPilot review queue. It distinguishes existing AI analysis from local deterministic analysis while keeping matches, blocking gaps and secondary context visible without relying on color alone.',
      },
    },
  },
} satisfies Meta<typeof ReviewQueueTechnologyComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExistingAiMatch: Story = {
  args: {
    comparison: {
      source: 'AI_REUSED',
      aiDecision: 'MATCH',
      aiConfidence: 92,
      technologies: ['PHP', 'Symfony', 'React', 'PostgreSQL', 'Docker'],
      primaryTechnologies: ['PHP', 'Symfony', 'React'],
      secondaryTechnologies: ['PostgreSQL', 'Docker'],
      matchingTechnologies: ['PHP', 'Symfony', 'React', 'Docker'],
      missingTechnologies: ['Kubernetes'],
      missingMustHaves: [],
      missingNiceToHaves: ['Kubernetes'],
    },
  },
};

export const LocalAnalysisWithBlockingGaps: Story = {
  args: {
    comparison: {
      source: 'DETERMINISTIC',
      technologies: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes'],
      primaryTechnologies: ['Java', 'Spring Boot'],
      secondaryTechnologies: ['Kafka', 'Kubernetes'],
      matchingTechnologies: ['Kafka'],
      missingTechnologies: ['Java', 'Spring Boot', 'Kubernetes'],
      missingMustHaves: ['Java', 'Spring Boot'],
      missingNiceToHaves: ['Kubernetes'],
    },
  },
};

export const NoDetectedGaps: Story = {
  args: {
    comparison: {
      source: 'DETERMINISTIC',
      technologies: ['PHP', 'Symfony'],
      primaryTechnologies: ['PHP', 'Symfony'],
      secondaryTechnologies: [],
      matchingTechnologies: ['PHP', 'Symfony'],
      missingTechnologies: [],
      missingMustHaves: [],
      missingNiceToHaves: [],
    },
  },
};

export const LongTechnologyNames: Story = {
  args: {
    comparison: {
      source: 'AI_REUSED',
      aiDecision: 'NO_MATCH',
      aiConfidence: 78,
      technologies: [
        'Amazon Elastic Kubernetes Service',
        'OpenID Connect / OAuth 2.0',
        'Event-driven architecture with Apache Kafka',
      ],
      primaryTechnologies: [
        'Amazon Elastic Kubernetes Service',
        'Event-driven architecture with Apache Kafka',
      ],
      secondaryTechnologies: ['OpenID Connect / OAuth 2.0'],
      matchingTechnologies: ['OpenID Connect / OAuth 2.0'],
      missingTechnologies: [
        'Amazon Elastic Kubernetes Service',
        'Event-driven architecture with Apache Kafka',
      ],
      missingMustHaves: ['Amazon Elastic Kubernetes Service'],
      missingNiceToHaves: ['Event-driven architecture with Apache Kafka'],
    },
  },
};
