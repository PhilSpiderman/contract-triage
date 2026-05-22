import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { analyseContract } from '@/lib/claude';
import { isDemoEnabled } from '@/lib/config';
import { loadSample } from '@/lib/samples';
import { hasUserAnalysed, recordUserAnalysis } from '@/lib/rate-limit';
import { getCachedReport, setCachedReport } from '@/lib/triage-cache';

export async function POST(req: NextRequest) {
  // 1. Demo kill switch
  if (!isDemoEnabled()) {
    return NextResponse.json(
      { error: 'The demo is currently paused.', code: 'DEMO_DISABLED' },
      { status: 503 },
    );
  }

  // 2. Authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Sign in to use the demo.', code: 'UNAUTHENTICATED' },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  // 3. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { sampleId } = (body as { sampleId?: unknown }) ?? {};
  if (typeof sampleId !== 'string' || !sampleId) {
    return NextResponse.json({ error: 'sampleId is required' }, { status: 400 });
  }

  // 4. Load sample (validates it exists)
  let sample;
  try {
    sample = loadSample(sampleId);
  } catch {
    return NextResponse.json({ error: 'Unknown sample' }, { status: 400 });
  }

  // 5. Per-user rate limit
  const alreadyAnalysed = await hasUserAnalysed(userId, sampleId);
  if (alreadyAnalysed) {
    return NextResponse.json(
      {
        error: "You've already analysed this sample.",
        code: 'ALREADY_ANALYSED',
      },
      { status: 409 },
    );
  }

  // 6. Per-sample cache hit — skip the Anthropic call, still spend the user's slot
  const cached = await getCachedReport(sampleId);
  if (cached) {
    await recordUserAnalysis(userId, sampleId);
    return NextResponse.json(cached);
  }

  // 7. Run analysis
  try {
    const report = await analyseContract(sample.text);
    await recordUserAnalysis(userId, sampleId);
    await setCachedReport(sampleId, report);
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    console.error('Triage failed:', message);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
