import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signIn, auth } from '@/auth';
import { isSignupEnabled } from '@/lib/config';
import { storePendingLead } from '@/lib/leads';
import { SignupForm } from './signup-form';

export const metadata = {
  title: 'sign in — contract triage',
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect('/account');

  const signupOpen = isSignupEnabled();

  async function submitSignup(formData: FormData) {
    'use server';

    const email = String(formData.get('email') ?? '')
      .trim()
      .toLowerCase();
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }

    const name = String(formData.get('name') ?? '').trim();
    const consent = formData.get('consent') === 'on';
    const role = consent ? String(formData.get('role') ?? '').trim() : '';
    const context = consent ? String(formData.get('context') ?? '').trim() : '';

    await storePendingLead({ email, name, consent, role, context });

    await signIn('resend', { email, redirectTo: '/account' });
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
      ) : (
        <SignupForm action={submitSignup} />
      )}

      <p className="auth-tos">
        By signing in you agree to the{' '}
        <Link href="/terms">terms of use</Link> and{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </main>
  );
}
