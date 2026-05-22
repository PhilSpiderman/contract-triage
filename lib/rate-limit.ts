// Per-user analysis tracking.
//
// Each user can analyse each sample at most once. With 5 samples in v1,
// that caps usage at 5 analyses per account. After they've burned all 5,
// the UI shows a "drop Chris a line" message — the loss-leader → lead
// conversion point.
//
// Storage: a Redis set per user keyed by user ID, containing the sample
// IDs they've analysed. Lifetime governed by the user record itself —
// when Auth.js deletes a user, this set is orphaned (we should clean it
// up in the Phase 12 cron job).

import { getRedis } from './redis';

function key(userId: string): string {
  return `analyses:${userId}`;
}

export async function hasUserAnalysed(
  userId: string,
  sampleId: string,
): Promise<boolean> {
  const redis = getRedis();
  const result = await redis.sismember(key(userId), sampleId);
  return result === 1;
}

export async function recordUserAnalysis(
  userId: string,
  sampleId: string,
): Promise<void> {
  const redis = getRedis();
  await redis.sadd(key(userId), sampleId);
}

export async function getUserAnalyses(userId: string): Promise<string[]> {
  const redis = getRedis();
  const members = await redis.smembers(key(userId));
  return (members as string[] | null) ?? [];
}

export async function deleteUserAnalyses(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key(userId));
}
