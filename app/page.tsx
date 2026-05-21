import { loadAllSamples } from '@/lib/samples';
import { TriageApp } from './triage-app';

export default function Home() {
  const samples = loadAllSamples();
  return <TriageApp samples={samples} />;
}
