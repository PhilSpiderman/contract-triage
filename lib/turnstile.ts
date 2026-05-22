// Server-side verification of Cloudflare Turnstile tokens.
//
// Flow:
//   - Client renders the Turnstile widget via Cloudflare's script
//   - Widget produces a token (`cf-turnstile-response` form field) once
//     the visitor passes (invisible to most legitimate users)
//   - This module POSTs the token + our secret key to Cloudflare's
//     siteverify endpoint and returns true/false
//
// Test keys (work without any Cloudflare account):
//   site:   1x00000000000000000000AA   — always passes
//   secret: 1x0000000000000000000000000000000AA — always passes
// Used in development. Production swaps for real keys created in the
// Cloudflare dashboard (see TODO.md → "Swap Turnstile test keys for real
// ones at deploy time").

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — denying by default');
    return false;
  }
  if (!token) return false;

  const body = new URLSearchParams();
  body.append('secret', secret);
  body.append('response', token);
  if (remoteIp) body.append('remoteip', remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body,
    });
    if (!res.ok) {
      console.error('[turnstile] siteverify HTTP', res.status);
      return false;
    }
    const data = (await res.json()) as TurnstileVerifyResponse;
    if (!data.success) {
      console.error('[turnstile] verification failed:', data['error-codes']);
    }
    return data.success;
  } catch (err) {
    // Log message only — the fetch body contains the Turnstile secret;
    // a raw err object could include it in a wrapped stack.
    const message = err instanceof Error ? err.message : String(err);
    console.error('[turnstile] siteverify request error:', message);
    return false;
  }
}
