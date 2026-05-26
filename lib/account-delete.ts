// Wipes a user account and all associated data from Upstash.
//
// Called by:
//   - The self-serve deletion action on /account/delete (UK GDPR
//     right-to-erasure)
//   - The 12-month inactivity cron (Phase 12b)
//
// Deletes both Auth.js-managed records (user, email index, account,
// account-by-user index, session, session-by-user index) via the
// adapter's deleteUser, and our app-specific per-user records
// (lead-profile, analyses set, any in-flight pending-lead).

import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { getRedis } from './redis';
import { deleteLeadProfile } from './leads';
import { deleteUserAnalyses } from './rate-limit';
import { deleteLastActive } from './last-active';

export async function deleteUserAndAllData(
  userId: string,
  email: string,
): Promise<void> {
  const redis = getRedis();

  // App-specific keys first. If anything later fails the user is at
  // worst stuck with the Auth.js record alone — recoverable.
  await Promise.all([
    deleteLeadProfile(userId),
    deleteUserAnalyses(userId),
    deleteLastActive(userId),
    // Lingering pending-lead from a never-completed signup attempt.
    email ? redis.del(`pending-lead:${email.toLowerCase()}`) : Promise.resolve(0),
  ]);

  // Auth.js bookkeeping. The adapter's deleteUser handles user record,
  // email index, account, session, and the two reverse indexes.
  const adapter = UpstashRedisAdapter(redis);
  if (adapter.deleteUser) {
    await adapter.deleteUser(userId);
  }
}
