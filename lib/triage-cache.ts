// Global per-sample triage result cache.
//
// Five fictitious samples, one playbook — most users will analyse the same
// content the model has already seen. Cache the report by sample so a
// repeat analysis avoids a fresh Anthropic call.
//
// Key shape: triage:v1:<sampleId>:<playbookVersion>
//   - playbookVersion in the key means editing data/playbook.yaml's
//     `version` field auto-invalidates every cached report.
//   - The v1 prefix is a manual escape hatch — bump it if the model,
//     prompt, or tool schema changes in a way the playbook version
//     wouldn't capture.
//
// Cache failures are non-fatal: a read error returns null (fall through to
// a fresh call), a write error is logged and swallowed.

import { getRedis } from './redis';
import { loadPlaybook } from './playbook';
import type { TriageReport } from './types';

const TTL_SECONDS = 6 * 60 * 60;
const KEY_PREFIX = 'triage:v1';
const HITS_KEY = 'metrics:cache:hits';
const MISSES_KEY = 'metrics:cache:misses';

function key(sampleId: string): string {
  const { version } = loadPlaybook();
  return `${KEY_PREFIX}:${sampleId}:${version}`;
}

export async function getCachedReport(
  sampleId: string,
): Promise<TriageReport | null> {
  try {
    const redis = getRedis();
    const cached = await redis.get<TriageReport>(key(sampleId));
    // INCR a counter for admin-view cost sanity. Wrapped in its own try so
    // a metric failure can never block a cache result.
    try {
      await redis.incr(cached ? HITS_KEY : MISSES_KEY);
    } catch {
      /* metric is best-effort */
    }
    return cached ?? null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('triage-cache read failed:', message);
    return null;
  }
}

export async function setCachedReport(
  sampleId: string,
  report: TriageReport,
): Promise<void> {
  try {
    // Strip token usage — meaningless for a cache hit and would mislead
    // any downstream consumer reading it as a "fresh call" stat.
    const { usage: _usage, ...rest } = report;
    const redis = getRedis();
    await redis.set(key(sampleId), rest, { ex: TTL_SECONDS });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('triage-cache write failed:', message);
  }
}
