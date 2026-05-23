// HTTP Basic Auth gate for /admin/*.
//
// Chris is the only admin. A single shared password (ADMIN_PASSWORD env
// var) is checked against the standard Basic credentials header. The
// browser handles the credential prompt — no form, no cookie, no
// session state. Logout = close the browser tab or clear site data.
//
// Runs on the Edge runtime (Next.js default for middleware), so no
// Buffer / Node-only APIs — use atob() for base64 decoding.
//
// Fail-closed: if ADMIN_PASSWORD is missing, /admin returns 503.

import { NextRequest, NextResponse } from 'next/server';

const REALM = 'contract-triage admin';

export function middleware(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return new NextResponse('Admin not configured', { status: 503 });
  }

  const header = req.headers.get('authorization');
  if (header?.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(':');
      const password = sep >= 0 ? decoded.slice(sep + 1) : decoded;
      if (password === expected) return NextResponse.next();
    } catch {
      // Malformed base64 — fall through to 401.
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
