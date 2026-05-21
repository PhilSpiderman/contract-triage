// Eval harness: runs every sample in evals/expected.yaml through the live
// triage pipeline, compares the structured output against ground truth, and
// writes a scorecard to evals/results.md.
//
// Usage: npm run evals

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseEnv } from 'dotenv';
import { parse as parseYaml } from 'yaml';
import { loadSample } from '../lib/samples.js';
import { analyseContract } from '../lib/claude.js';

// ── Env (same per-project pattern as scripts/test-triage.ts) ──────────────
const envPath = path.resolve(
  process.cwd(),
  '../../../../secretsecrets/contract-triage.env',
);

try {
  const parsed = parseEnv(readFileSync(envPath, 'utf-8'));
  if (parsed.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = parsed.ANTHROPIC_API_KEY;
  }
} catch (err) {
  console.error(
    `Could not load env from ${envPath}: ${err instanceof Error ? err.message : err}`,
  );
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set');
  process.exit(1);
}

// ── Types ─────────────────────────────────────────────────────────────────
interface ExpectedEntry {
  id: string;
  expected_verdict: string;
  expected_flags: string[];
  notes?: string;
}

interface ExpectedFile {
  samples: ExpectedEntry[];
}

interface SampleResult {
  id: string;
  expected_verdict: string;
  actual_verdict: string;
  verdict_match: boolean;
  expected_flags: string[];
  actual_flags: string[];
  caught: string[];
  missed: string[];
  extra: string[];
  time_seconds: number;
  tokens_in: number;
  tokens_out: number;
  cache_read: number;
  cache_creation: number;
}

// ── Per-sample run ────────────────────────────────────────────────────────
async function runOne(entry: ExpectedEntry): Promise<SampleResult> {
  const sample = loadSample(entry.id);
  const start = Date.now();
  const report = await analyseContract(sample.text);
  const elapsed = (Date.now() - start) / 1000;

  const expectedSet = new Set(entry.expected_flags);
  const actualSet = new Set(report.flags);
  const caught = entry.expected_flags.filter((f) => actualSet.has(f));
  const missed = entry.expected_flags.filter((f) => !actualSet.has(f));
  const extra = report.flags.filter((f) => !expectedSet.has(f));

  return {
    id: entry.id,
    expected_verdict: entry.expected_verdict,
    actual_verdict: report.overall_verdict,
    verdict_match: report.overall_verdict === entry.expected_verdict,
    expected_flags: entry.expected_flags,
    actual_flags: report.flags,
    caught,
    missed,
    extra,
    time_seconds: elapsed,
    tokens_in: report.usage?.input_tokens ?? 0,
    tokens_out: report.usage?.output_tokens ?? 0,
    cache_read: report.usage?.cache_read_input_tokens ?? 0,
    cache_creation: report.usage?.cache_creation_input_tokens ?? 0,
  };
}

// ── Markdown writer ───────────────────────────────────────────────────────
function buildMarkdown(results: SampleResult[]): string {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const verdictMatches = results.filter((r) => r.verdict_match).length;
  const totalExpected = results.reduce((s, r) => s + r.expected_flags.length, 0);
  const totalCaught = results.reduce((s, r) => s + r.caught.length, 0);
  const totalExtra = results.reduce((s, r) => s + r.extra.length, 0);
  const totalTime = results.reduce((s, r) => s + r.time_seconds, 0);
  const totalCacheRead = results.reduce((s, r) => s + r.cache_read, 0);
  const totalCacheCreated = results.reduce((s, r) => s + r.cache_creation, 0);
  const totalTokensIn = results.reduce((s, r) => s + r.tokens_in, 0);
  const totalTokensOut = results.reduce((s, r) => s + r.tokens_out, 0);
  const recallPct =
    totalExpected > 0 ? ((totalCaught / totalExpected) * 100).toFixed(0) : '100';

  const summary = [
    '# Eval results',
    '',
    `_Generated: ${now}_`,
    '',
    '## Summary',
    '',
    '| Metric | Value |',
    '|---|---|',
    `| Verdict accuracy | **${verdictMatches}/${results.length}** |`,
    `| Expected-flag recall | **${totalCaught}/${totalExpected}** (${recallPct}%) |`,
    `| Extra flags surfaced (model > ground truth) | ${totalExtra} |`,
    `| Total wall-clock | ${totalTime.toFixed(1)}s |`,
    `| Tokens in / out (across ${results.length} calls) | ${totalTokensIn.toLocaleString()} / ${totalTokensOut.toLocaleString()} |`,
    `| Cache: written / read | ${totalCacheCreated.toLocaleString()} / ${totalCacheRead.toLocaleString()} |`,
    '',
    '## Per-sample',
    '',
    '| # | Sample | Actual verdict | Match | Expected flags | Caught | Missed | Extra (model-surfaced) |',
    '|---|---|---|---|---|---|---|---|',
  ];

  const rows = results.map((r, i) => {
    const fmt = (xs: string[]) =>
      xs.length === 0 ? '—' : xs.map((f) => `\`${f}\``).join(', ');
    return `| ${i + 1} | \`${r.id}\` | ${r.actual_verdict} | ${r.verdict_match ? '✓' : '✗'} | ${r.expected_flags.length === 0 ? '—' : r.expected_flags.length} | ${fmt(r.caught)} | ${fmt(r.missed)} | ${fmt(r.extra)} |`;
  });

  const methodology = [
    '',
    '## Methodology',
    '',
    'The harness loads `evals/expected.yaml` (ground truth set by the author before running the model), executes each sample through the live pipeline, and compares the structured output against expectations. Three metrics are tracked:',
    '',
    '- **Verdict accuracy** — did the overall verdict (`standard` / `minor_deviation` / `needs_human`) match.',
    '- **Expected-flag recall** — of the flags the author anticipated, how many the model caught.',
    '- **Extra flags surfaced** — flags the model raised that were not in `expected.yaml`. These are reported separately rather than counted as false positives. On review during development, the author concluded the model\'s reads were defensible (e.g. catching a missing termination clause that the author had overlooked when writing ground truth).',
    '',
    "The harness is non-deterministic — Anthropic's API uses a default temperature of 1.0, so individual flags and wording vary between runs. The headline metrics (verdict accuracy, recall) have been stable across runs observed during development.",
    '',
    'Run with: `npm run evals`',
    '',
  ];

  return [...summary, ...rows, ...methodology].join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────
const expected = parseYaml(
  readFileSync('evals/expected.yaml', 'utf-8'),
) as ExpectedFile;

async function main() {
  console.log(`Running ${expected.samples.length} evals against expected.yaml\n`);
  const results: SampleResult[] = [];

  for (const entry of expected.samples) {
    process.stdout.write(`  ${entry.id.padEnd(28)} `);
    try {
      const r = await runOne(entry);
      results.push(r);
      const status = r.verdict_match ? 'PASS' : 'FAIL';
      const extraStr = r.extra.length > 0 ? `, +${r.extra.length} extra` : '';
      console.log(
        `${status}  ${r.caught.length}/${r.expected_flags.length} flags${extraStr}  (${r.time_seconds.toFixed(1)}s)`,
      );
    } catch (err) {
      console.log(`ERROR: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (results.length === 0) {
    console.error('\nNo results — every sample failed.');
    process.exit(1);
  }

  const verdictMatches = results.filter((r) => r.verdict_match).length;
  const totalExpected = results.reduce((s, r) => s + r.expected_flags.length, 0);
  const totalCaught = results.reduce((s, r) => s + r.caught.length, 0);
  const totalExtra = results.reduce((s, r) => s + r.extra.length, 0);
  const totalTime = results.reduce((s, r) => s + r.time_seconds, 0);
  const recallPct =
    totalExpected > 0 ? ((totalCaught / totalExpected) * 100).toFixed(0) : '100';

  console.log('\n' + '─'.repeat(60));
  console.log(`Verdict accuracy:      ${verdictMatches}/${results.length}`);
  console.log(`Expected-flag recall:  ${totalCaught}/${totalExpected}  (${recallPct}%)`);
  console.log(`Extra flags surfaced:  ${totalExtra}`);
  console.log(`Total time:            ${totalTime.toFixed(1)}s`);

  const md = buildMarkdown(results);
  writeFileSync('evals/results.md', md);
  console.log('\nResults written to evals/results.md');
}

main().catch((err) => {
  console.error('\nEval run failed:', err);
  process.exit(1);
});
