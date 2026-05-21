import { readFileSync } from 'node:fs';
import { parse as parseEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ONLY ANTHROPIC_API_KEY from this project's dedicated secrets file.
// We use dotenv.parse() (not dotenv.config()) so the file contents are parsed
// into a local object and never auto-applied to process.env. We then copy
// the single key we need. Any other entries in the file stay out of process
// memory entirely.
const secretsPath = path.resolve(
  __dirname,
  '../../../../secretsecrets/contract-triage.env',
);

try {
  const parsed = parseEnv(readFileSync(secretsPath, 'utf-8'));
  if (parsed.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = parsed.ANTHROPIC_API_KEY;
  }
} catch {
  // File missing (e.g. on Vercel) — env should already be set there.
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    `[env] ANTHROPIC_API_KEY not set. Expected at ${secretsPath} or in process env.`,
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
