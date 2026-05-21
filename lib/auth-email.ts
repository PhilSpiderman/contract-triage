// Custom magic-link email sent by Auth.js via Resend.
// Called by the Resend provider's sendVerificationRequest hook.

interface SendVerificationParams {
  identifier: string;
  url: string;
  provider: { from?: string };
}

const FROM_DEFAULT = 'Chris @ hands on with.ai <noreply@get.handsonwith.ai>';
const REPLY_TO = 'chris@handsonwith.ai';

function textBody(url: string): string {
  return `Hi,

Click the link below to sign in to the contract triage demo:

${url}

This link expires in 24 hours. If you didn't request it, just ignore this email — nothing will happen.

Cheers,
Chris
hands on with.ai
`;
}

function htmlBody(url: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.55; color: #1a1a1a; max-width: 560px; margin: 32px auto; padding: 0 16px;">
  <p>Hi,</p>
  <p>Click the link below to sign in to the contract triage demo:</p>
  <p style="margin: 24px 0;">
    <a href="${url}" style="display: inline-block; background: #e8725c; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
      Sign in to the demo
    </a>
  </p>
  <p style="color: #6a6a6a; font-size: 14px;">Or paste this URL into your browser:<br><span style="word-break: break-all;">${url}</span></p>
  <p style="color: #6a6a6a; font-size: 14px;">This link expires in 24 hours. If you didn't request it, just ignore this email — nothing will happen.</p>
  <p style="margin-top: 32px;">Cheers,<br>Chris<br><a href="https://handsonwith.ai" style="color: #6a6a6a;">hands on with.ai</a></p>
</body>
</html>`;
}

export async function sendMagicLinkEmail(params: SendVerificationParams) {
  const { identifier, url, provider } = params;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: provider.from ?? FROM_DEFAULT,
      to: [identifier],
      subject: 'Your magic link for the contract triage demo',
      text: textBody(url),
      html: htmlBody(url),
      reply_to: REPLY_TO,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend email failed: ${res.status} ${body}`);
  }
}
