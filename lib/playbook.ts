import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import type { Playbook } from './types';

let cached: Playbook | null = null;

export function loadPlaybook(): Playbook {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), 'data', 'playbook.yaml');
  const text = fs.readFileSync(filePath, 'utf-8');
  cached = parse(text) as Playbook;
  return cached;
}

export function playbookAsYaml(): string {
  return fs.readFileSync(
    path.join(process.cwd(), 'data', 'playbook.yaml'),
    'utf-8',
  );
}
