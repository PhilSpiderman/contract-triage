import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load secrets from host-level secretsecrets folder (4 levels up from this file).
// Skipped silently if not found (e.g. on Vercel, where env vars are set in the dashboard).
const secretsPath = path.resolve(__dirname, '../../../../secretsecrets/.env');
const result = dotenvConfig({ path: secretsPath });

if (result.error && !process.env.ANTHROPIC_API_KEY) {
  console.warn(`[env] Could not load secrets from ${secretsPath}. Set ANTHROPIC_API_KEY in the environment.`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
