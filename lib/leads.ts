// Lead capture data lifecycle:
//
// 1. User fills the signup form (email + optional name + optional consent +
//    optional role/context if consent ticked).
// 2. We store a "pending lead" record in Redis keyed by email, with a 1-hour
//    TTL (matches the magic-link expiry window).
// 3. User clicks magic link → Auth.js creates the user record → our
//    events.createUser hook calls consumePendingLead, merges into a per-user
//    profile record, deletes the pending entry.
// 4. The profile record persists alongside the Auth.js user record. Lifetime
//    governed by the privacy policy:
//      - If consent_follow_up = false: deleted with user on 12-month inactivity
//      - If consent_follow_up = true:  retained until consent withdrawn

import { getRedis } from './redis';

export interface PendingLead {
  email: string;
  name: string;
  consent: boolean;
  role: string;
  context: string;
  capturedAt: string;
}

export interface LeadProfile {
  name: string;
  consent_follow_up: boolean;
  consent_recorded_at: string | null;
  role: string;
  context: string;
}

const PENDING_LEAD_TTL_SECONDS = 60 * 60; // 1 hour

function pendingKey(email: string): string {
  return `pending-lead:${email.toLowerCase()}`;
}

function profileKey(userId: string): string {
  return `lead-profile:${userId}`;
}

export async function storePendingLead(
  data: Omit<PendingLead, 'capturedAt'>,
): Promise<void> {
  const redis = getRedis();
  await redis.set<PendingLead>(
    pendingKey(data.email),
    { ...data, capturedAt: new Date().toISOString() },
    { ex: PENDING_LEAD_TTL_SECONDS },
  );
}

export async function consumePendingLead(
  email: string,
): Promise<PendingLead | null> {
  const redis = getRedis();
  const key = pendingKey(email);
  const data = await redis.get<PendingLead>(key);
  if (data) await redis.del(key);
  return data ?? null;
}

export async function storeLeadProfile(
  userId: string,
  profile: LeadProfile,
): Promise<void> {
  const redis = getRedis();
  await redis.set<LeadProfile>(profileKey(userId), profile);
}

export async function getLeadProfile(
  userId: string,
): Promise<LeadProfile | null> {
  const redis = getRedis();
  return (await redis.get<LeadProfile>(profileKey(userId))) ?? null;
}

export async function deleteLeadProfile(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(profileKey(userId));
}
