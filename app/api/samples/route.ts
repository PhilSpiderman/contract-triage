import { NextResponse } from 'next/server';
import { loadAllSamples } from '@/lib/samples';

export async function GET() {
  const samples = loadAllSamples();
  return NextResponse.json(samples);
}
