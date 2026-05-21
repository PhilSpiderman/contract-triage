import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';
import { getRedis } from './lib/redis';
import { sendMagicLinkEmail } from './lib/auth-email';

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
});
