// Daily cron: deletes accounts inactive for INACTIVE_DELETION_DAYS days
// (default 365). Enforces the 12-month retention commitment in the
// privacy policy.
//
// Auth: Vercel Cron automatically sets `Authorization: Bearer <CRON_SECRET>`
// on scheduled invocations. We reject anything else as 401.
//
// Schedule: configured in vercel.json (daily, 04:00 UTC). The route is
// also manually invocable for testing — set CRON_SECRET locally and
// curl with the matching header.
//
// Threshold knob: INACTIVE_DELETION_DAYS env var. Defaults to 365.
// Set to 1 locally to test the deletion path against backdated test
// accounts without waiting a year.

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { deleteUserAndAllData } from '@/lib/account-delete';

const DEFAULT_INACTIVE_DAYS = 365;
const SCAN_BATCH = 100;

interface AuthUserRecord {
  id?: string;
  email?: string;
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 503 },
    );
  }

  const header = req.headers.get('authorization');
  if (header !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days =
    Number(process.env.INACTIVE_DELETION_DAYS) || DEFAULT_INACTIVE_DAYS;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const redis = getRedis();
  let cursor: string | number = 0;
  let scanned = 0;
  let deleted = 0;
  const errors: string[] = [];

  do {
    const [next, keys]: [string, string[]] = await redis.scan(cursor, {
      match: 'last-active:*',
      count: SCAN_BATCH,
    });
    cursor = next;

    for (const key of keys) {
      scanned += 1;
      const lastActive = await redis.get<number>(key);
      if (lastActive === null || lastActive >= cutoff) continue;

      const userId = key.slice('last-active:'.length);
      try {
        const user = await redis.get<AuthUserRecord>(`user:${userId}`);
        const email = user?.email ?? '';
        await deleteUserAndAllData(userId, email);
        // Belt and braces: ensure the last-active key itself is gone even
        // if deleteUserAndAllData's account-delete path didn't catch it
        // (the user record may have already been missing).
        await redis.del(key);
        deleted += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${userId}: ${message}`);
      }
    }
  } while (cursor !== '0');

  return NextResponse.json({
    ok: true,
    scanned,
    deleted,
    cutoffDays: days,
    errors,
  });
}
