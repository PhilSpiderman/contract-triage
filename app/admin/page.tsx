// Read-only admin dashboard. Gated by HTTP Basic Auth in middleware.ts.
//
// All numbers are server-rendered on each request. force-dynamic prevents
// any Next.js caching layer from holding stale values.

import { getRedis } from '@/lib/redis';
import { countKeys, sumSetSizes } from '@/lib/admin-stats';
import { isDemoEnabled, isSignupEnabled, isIndexingAllowed } from '@/lib/config';

export const dynamic = 'force-dynamic';

const TOTAL_SAMPLES = 5;

async function loadStats() {
  const redis = getRedis();

  const [
    signups,
    pendingSignups,
    cachedSamples,
    totalAnalyses,
    hitsRaw,
    missesRaw,
  ] = await Promise.all([
    countKeys(redis, 'lead-profile:*'),
    countKeys(redis, 'pending-lead:*'),
    countKeys(redis, 'triage:v1:*'),
    sumSetSizes(redis, 'analyses:*'),
    redis.get<number>('metrics:cache:hits'),
    redis.get<number>('metrics:cache:misses'),
  ]);

  const hits = hitsRaw ?? 0;
  const misses = missesRaw ?? 0;
  const total = hits + misses;
  const hitRatio = total > 0 ? hits / total : null;

  return {
    signups,
    pendingSignups,
    cachedSamples,
    totalAnalyses,
    hits,
    misses,
    hitRatio,
  };
}

function pct(ratio: number | null): string {
  if (ratio === null) return '—';
  return `${(ratio * 100).toFixed(1)}%`;
}

function flagBadge(on: boolean): string {
  return on ? 'on' : 'off';
}

export default async function AdminPage() {
  const stats = await loadStats();

  return (
    <main className="admin">
      <header className="admin-header">
        <h1>admin</h1>
        <p className="admin-sub">contract-triage — internal status</p>
      </header>

      <section className="admin-section">
        <h2>activity</h2>
        <dl className="admin-dl">
          <dt>verified signups</dt>
          <dd>{stats.signups}</dd>
          <dt>pending verifications (1h window)</dt>
          <dd>{stats.pendingSignups}</dd>
          <dt>total analyses run</dt>
          <dd>{stats.totalAnalyses}</dd>
        </dl>
      </section>

      <section className="admin-section">
        <h2>cache</h2>
        <dl className="admin-dl">
          <dt>currently cached samples</dt>
          <dd>
            {stats.cachedSamples} / {TOTAL_SAMPLES}
          </dd>
          <dt>cache hits</dt>
          <dd>{stats.hits}</dd>
          <dt>cache misses</dt>
          <dd>{stats.misses}</dd>
          <dt>hit ratio</dt>
          <dd>{pct(stats.hitRatio)}</dd>
        </dl>
      </section>

      <section className="admin-section">
        <h2>flags</h2>
        <dl className="admin-dl">
          <dt>DEMO_ENABLED</dt>
          <dd>{flagBadge(isDemoEnabled())}</dd>
          <dt>SIGNUP_ENABLED</dt>
          <dd>{flagBadge(isSignupEnabled())}</dd>
          <dt>ALLOW_INDEXING</dt>
          <dd>{flagBadge(isIndexingAllowed())}</dd>
        </dl>
      </section>

      <footer className="admin-footer">
        <p>read-only. mutations via upstash console or vercel env vars.</p>
      </footer>
    </main>
  );
}
