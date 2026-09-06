import type { ReactNode } from 'react';

import { ConnectorDeadLettersSection } from '@/components/ConnectorDeadLettersSection';
import { ConnectorRoadmapSection } from '@/components/ConnectorRoadmapSection';

import './connectors.css';

export default function ConnectorsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ConnectorDeadLettersSection />
      <ConnectorRoadmapSection />
    </>
  );
}
