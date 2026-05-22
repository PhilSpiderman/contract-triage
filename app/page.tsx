import { loadAllSamples } from '@/lib/samples';
import { isDemoEnabled } from '@/lib/config';
import { auth } from '@/auth';
import { getUserAnalyses } from '@/lib/rate-limit';
import { TriageApp } from './triage-app';

export default async function Home() {
  const samples = loadAllSamples();
  const session = await auth();
  const userId = session?.user?.id;
  const analysedSampleIds = userId ? await getUserAnalyses(userId) : [];

  return (
    <TriageApp
      samples={samples}
      demoEnabled={isDemoEnabled()}
      signedIn={Boolean(userId)}
      userEmail={session?.user?.email ?? null}
      analysedSampleIds={analysedSampleIds}
    />
  );
}
