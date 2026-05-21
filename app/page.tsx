import { loadAllSamples } from '@/lib/samples';
import { isDemoEnabled } from '@/lib/config';
import { TriageApp } from './triage-app';

export default function Home() {
  const samples = loadAllSamples();
  return <TriageApp samples={samples} demoEnabled={isDemoEnabled()} />;
}
