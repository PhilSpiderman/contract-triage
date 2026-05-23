// Read-only stat helpers for the /admin page.
//
// All scans use cursor pagination with a modest batch size — fine for
// the data volumes this demo will see, won't block Redis. SCAN is
// non-blocking by design; the counts are eventually-consistent against
// concurrent writes, which is acceptable for a status dashboard.

import type { Redis } from '@upstash/redis';

const SCAN_BATCH = 100;

export async function countKeys(redis: Redis, match: string): Promise<number> {
  let cursor: string | number = 0;
  let count = 0;
  do {
    const [next, keys]: [string, string[]] = await redis.scan(cursor, {
      match,
      count: SCAN_BATCH,
    });
    count += keys.length;
    cursor = next;
  } while (cursor !== '0');
  return count;
}

export async function sumSetSizes(
  redis: Redis,
  match: string,
): Promise<number> {
  let cursor: string | number = 0;
  let total = 0;
  do {
    const [next, keys]: [string, string[]] = await redis.scan(cursor, {
      match,
      count: SCAN_BATCH,
    });
    for (const k of keys) {
      total += await redis.scard(k);
    }
    cursor = next;
  } while (cursor !== '0');
  return total;
}
