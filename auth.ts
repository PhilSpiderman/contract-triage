import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { getRedis } from './lib/redis';
import { sendMagicLinkEmail } from './lib/auth-email';
import { consumePendingLead, storeLeadProfile } from './lib/leads';
import { recordActivity } from './lib/last-active';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: UpstashRedisAdapter(getRedis()),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'hands on with.ai <noreply@get.handsonwith.ai>',
      sendVerificationRequest: sendMagicLinkEmail,
    }),
  ],
  pages: {
    signIn: '/signin',
    verifyRequest: '/signin/check-email',
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  events: {
    async createUser({ user }) {
      // Fires once, the first time a user verifies their magic link and an
      // account is created in Upstash. Two side-effects:
      //   - Merge any pending lead-capture data captured at signup time
      //   - Stamp last-active to now so the 12-month inactivity clock starts
      if (!user.id) return;

      // Stamp last-active first — small, independent, must not be skipped
      // by a downstream lead-merge failure.
      try {
        await recordActivity(user.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[auth] Failed to stamp initial last-active:', message);
      }

      try {
        if (!user.email) return;
        const lead = await consumePendingLead(user.email);
        if (!lead) return;
        await storeLeadProfile(user.id, {
          name: lead.name,
          consent_follow_up: lead.consent,
          consent_recorded_at: lead.consent ? lead.capturedAt : null,
          role: lead.consent ? lead.role : '',
          context: lead.consent ? lead.context : '',
        });
      } catch (err) {
        // Log message only — never the raw err object, which could carry
        // lead-profile fields (name/role/context) in a wrapped stack.
        const message = err instanceof Error ? err.message : String(err);
        console.error('[auth] Failed to merge lead profile:', message);
        // Don't rethrow — user can still sign in even if profile merge fails.
      }
    },
  },
});
