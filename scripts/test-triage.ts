// Quick CLI smoke test for the triage pipeline.
// Usage: npm run test:triage [sample-id]
// Default sample: 01-clean-nda

import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import { loadSample } from '../lib/samples.js';
import { analyseContract } from '../lib/claude.js';

// Anchor on the project root (cwd when invoked via `npm run`).
// Mirrors next.config.mjs so dev server and CLI resolve to the same .env.
const envPath = path.resolve(process.cwd(), '../../../../secretsecrets/.env');
const envResult = dotenvConfig({ path: envPath });

if (envResult.error && !process.env.ANTHROPIC_API_KEY) {
  console.error(`Could not load env from ${envPath}: ${envResult.error.message}`);
  process.exit(1);
}

const sampleId = process.argv[2] ?? '01-clean-nda';

async function main() {
  console.log(`\nAnalysing sample: ${sampleId}\n`);
  const sample = loadSample(sampleId);
  const start = Date.now();
  const report = await analyseContract(sample.text);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('─'.repeat(60));
  console.log(`OVERALL VERDICT: ${report.overall_verdict.toUpperCase()}`);
  console.log(`SUMMARY: ${report.summary}`);
  console.log(`FLAGS:   [${report.flags.join(', ') || 'none'}]`);
  console.log('─'.repeat(60));
  console.log('\nClause-by-clause:\n');
  for (const c of report.clause_analyses) {
    const marker =
      c.verdict === 'matches'
        ? '✓'
        : c.verdict === 'acceptable'
          ? '~'
          : c.verdict === 'missing'
            ? '?'
            : '✗';
    console.log(`  ${marker} ${c.clause_id.padEnd(22)} ${c.verdict.padEnd(12)} ${c.notes}`);
    if (c.suggested_redline) {
      console.log(`      → redline: ${c.suggested_redline.slice(0, 100)}...`);
    }
  }
  console.log();
  if (report.unflagged_observations?.length) {
    console.log('Other observations:');
    for (const o of report.unflagged_observations) console.log(`  • ${o}`);
    console.log();
  }
  console.log('─'.repeat(60));
  console.log(`Time: ${elapsed}s`);
  if (report.usage) {
    const u = report.usage;
    console.log(
      `Tokens: ${u.input_tokens} in / ${u.output_tokens} out` +
        (u.cache_read_input_tokens
          ? ` (${u.cache_read_input_tokens} from cache)`
          : u.cache_creation_input_tokens
            ? ` (${u.cache_creation_input_tokens} cached this run)`
            : ''),
    );
  }
}

main().catch((err) => {
  console.error('\nFailed:', err);
  process.exit(1);
});
