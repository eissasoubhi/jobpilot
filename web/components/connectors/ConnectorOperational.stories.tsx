import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import '@/app/connecteurs/connectors.css';
import { Badge, Button, Card, DataList, DataListItem } from '@/components/UI';

const meta = {
  title: 'Connecteurs/Operational rows',
  parameters: {
    docs: {
      description: {
        component:
          'Référence pour les connecteurs : état et santé lisibles d’abord, diagnostics secondaires plus calmes, actions explicites et densité adaptée au suivi opérationnel.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const HealthyAndAttention: Story = {
  render: () => (
    <Card>
      <DataList aria-label="Connecteurs disponibles">
        <DataListItem>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="actions"><Badge tone="good">READY</Badge><Badge tone="good">Sain</Badge><Badge tone="blue">API</Badge><Badge tone="good">Activé</Badge></div>
            <h3>Welcome to the Jungle</h3>
            <p className="small">Collecte autorisée et extraction stable. Les champs obligatoires sont complets.</p>
            <div className="actions"><Badge>Dernière sync : 00:42</Badge><Badge tone="good">18 nouvelles</Badge><Badge>0 échec</Badge></div>
            <div className="actions" style={{ marginTop: 12 }}><Button variant="secondary" size="small">Désactiver</Button><Button size="small">Tester maintenant</Button></div>
          </div>
        </DataListItem>
        <DataListItem>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="actions"><Badge tone="warn">PARTIAL</Badge><Badge tone="warn">À surveiller</Badge><Badge tone="blue">Gmail</Badge><Badge tone="good">Activé</Badge></div>
            <h3>Gmail</h3>
            <p className="small"><strong>À noter :</strong> certaines pièces jointes n’ont pas pu être analysées. Les messages déjà importés restent disponibles.</p>
            <div className="actions"><Badge>12 messages</Badge><Badge tone="good">4 offres</Badge><Badge tone="warn">2 échecs</Badge></div>
            <div className="actions" style={{ marginTop: 12 }}><Button variant="secondary" size="small">Désactiver</Button><Button size="small">Réessayer</Button></div>
          </div>
        </DataListItem>
      </DataList>
    </Card>
  ),
};
