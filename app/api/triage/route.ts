import { NextRequest, NextResponse } from 'next/server';
import { analyseContract } from '@/lib/claude';

const MAX_CONTRACT_LENGTH = 100_000;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { contractText } = (body as { contractText?: unknown }) ?? {};

  if (typeof contractText !== 'string' || contractText.trim().length === 0) {
    return NextResponse.json(
      { error: 'contractText (non-empty string) is required' },
      { status: 400 },
    );
  }

  if (contractText.length > MAX_CONTRACT_LENGTH) {
    return NextResponse.json(
      { error: `contractText too long (max ${MAX_CONTRACT_LENGTH} chars)` },
      { status: 400 },
    );
  }

  try {
    const report = await analyseContract(contractText);
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    console.error('Triage failed:', message);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
