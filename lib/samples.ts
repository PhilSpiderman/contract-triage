import fs from 'node:fs';
import path from 'node:path';
import type { Sample, SampleMeta } from './types';

const SAMPLES_DIR = path.join(process.cwd(), 'data', 'samples');

let cachedMeta: SampleMeta[] | null = null;

export function loadSampleIndex(): SampleMeta[] {
  if (cachedMeta) return cachedMeta;
  const indexPath = path.join(SAMPLES_DIR, 'index.json');
  cachedMeta = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as SampleMeta[];
  return cachedMeta;
}

export function loadSample(id: string): Sample {
  const meta = loadSampleIndex().find((m) => m.id === id);
  if (!meta) throw new Error(`Unknown sample: ${id}`);
  const filePath = path.join(SAMPLES_DIR, `${id}.md`);
  const text = fs.readFileSync(filePath, 'utf-8');
  return { ...meta, text };
}

export function loadAllSamples(): Sample[] {
  return loadSampleIndex().map((m) => loadSample(m.id));
}
