import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signIn, auth } from '@/auth';
import { isSignupEnabled } from '@/lib/config';
import { storePendingLead } from '@/lib/leads';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { SignupForm, type SignupFormState } from './signup-form';

export const metadata = {
  title: 'sign in — contract triage',
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect('/account');

  const signupOpen = isSignupEnabled();
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

  async function submitSignup(
    _prev: SignupFormState | null,
    formData: FormData,
  ): Promise<SignupFormState> {
    'use server';

    // 1. Captcha first — cheap to verify, blocks bots before any storage writes
    const token = String(formData.get('cf-turnstile-response') ?? '');
    if (!token) {
      return { error: 'Please complete the captcha and try again.' };
    }
    const captchaOk = await verifyTurnstileToken(token);
    if (!captchaOk) {
      return { error: 'Captcha verification failed. Please refresh and try again.' };
    }

    // 2. Email validation
    const email = String(formData.get('email') ?? '')
      .trim()
      .toLowerCase();
    if (!email || !email.includes('@')) {
      return { error: 'Please provide a valid email address.' };
    }

    // 3. Capture optional lead data (context fields are consent-conditional)
    const name = String(formData.get('name') ?? '').trim();
    const consent = formData.get('consent') === 'on';
    const role = consent ? String(formData.get('role') ?? '').trim() : '';
    const context = consent ? String(formData.get('context') ?? '').trim() : '';

    await storePendingLead({ email, name, consent, role, context });

    // 4. Trigger Auth.js sign-in — throws a redirect to /signin/check-email
    await signIn('resend', { email, redirectTo: '/account' });

    // Unreachable — signIn redirected
    return {};
  }

  return (
    <main className="auth-page">
      <p className="legal-back">
        <Link href="/">← back to the demo</Link>
      </p>

      <h1>Sign in</h1>
      <p className="auth-blurb">
        Enter your email and I'll send you a sign-in link. No password to
        remember — just one click in your inbox.
      </p>

      {!signupOpen ? (
        <div className="demo-paused-banner">
          <strong>Signups are paused right now.</strong> Check back soon, or
          drop Chris a line at{' '}
          <a href="mailto:chris@handsonwith.ai">chris@handsonwith.ai</a>.
        </div>
      ) : !turnstileSiteKey ? (
        <div className="demo-paused-banner">
          <strong>Signup is temporarily misconfigured.</strong> Captcha keys
          are not set. Drop Chris a line at{' '}
          <a href="mailto:chris@handsonwith.ai">chris@handsonwith.ai</a>.
        </div>
      ) : (
        <SignupForm action={submitSignup} turnstileSiteKey={turnstileSiteKey} />
      )}

      <p className="auth-tos">
        By signing in you agree to the{' '}
        <Link href="/terms">terms of use</Link> and{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </main>
  );
}
