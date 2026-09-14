import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ButtonLink } from './UI';

const meta = {
  title: 'Actions/ButtonLink',
  component: ButtonLink,
  tags: ['autodocs'],
  args: {
    href: '/offres',
    children: 'Voir les offres',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Navigation styled with the shared JobPilot button treatment. Use ButtonLink for navigation and Button for actions so semantics remain explicit.',
      },
    },
  },
} satisfies Meta<typeof ButtonLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Voir les offres' });

    await expect(link).toHaveAttribute('href', '/offres');
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

export const SecondarySmall: Story = {
  args: {
    variant: 'secondary',
    size: 'small',
    href: '/candidatures',
    children: 'Voir les candidatures',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Voir les candidatures' });

    await expect(link).toHaveAttribute('href', '/candidatures');
  },
};

export const LongLabelMobile: Story = {
  name: 'Long label · mobile',
  args: {
    variant: 'secondary',
    href: '/connecteurs',
    children: 'Consulter les connecteurs qui nécessitent votre attention',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', {
        name: 'Consulter les connecteurs qui nécessitent votre attention',
      }),
    ).toBeInTheDocument();
  },
};
