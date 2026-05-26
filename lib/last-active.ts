// Tracks a per-user "last active" Unix-millis timestamp.
//
// Updated in two places:
//   - On user creation (events.createUser in auth.ts) — gives every user a
//     clock from day one, so a never-active account is still deletable on
//     the same 12-month inactivity rule.
//   - On successful /api/triage call — the "last use of the demo" trigger
//     from the privacy policy.
//
// Read by the inactivity-cleanup cron (Phase 12b) and used as the basis
// for the 12-month auto-delete commitment in the privacy policy.

import { getRedis } from './redis';

function key(userId: string): string {
  return `last-active:${userId}`;
}

export async function recordActivity(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.set(key(userId), Date.now());
}

export async function getLastActive(userId: string): Promise<number | null> {
  const redis = getRedis();
  const raw = await redis.get<number>(key(userId));
  return raw ?? null;
}

export async function deleteLastActive(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key(userId));
}
