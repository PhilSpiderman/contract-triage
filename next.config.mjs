import { readFileSync } from 'node:fs';
import { parse as parseEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load secrets from this project's dedicated file. We use dotenv.parse() (not
// dotenv.config()) so the file contents are parsed into a local object and
// never auto-applied to process.env. We then copy only the named keys below.
// Any other entries in the file stay out of process memory entirely.
const SECRET_KEYS = [
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'AUTH_SECRET',
];

const secretsPath = path.resolve(
  __dirname,
  '../../../../secretsecrets/contract-triage.env',
);

try {
  const parsed = parseEnv(readFileSync(secretsPath, 'utf-8'));
  for (const key of SECRET_KEYS) {
    if (parsed[key] && !process.env[key]) {
      process.env[key] = parsed[key];
    }
  }
} catch {
  // File missing (e.g. on Vercel) — env should already be set there.
}

for (const key of SECRET_KEYS) {
  if (!process.env[key]) {
    console.warn(`[env] ${key} not set. Expected at ${secretsPath} or in process env.`);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
