import Link from 'next/link';
import { signIn, auth } from '@/auth';
import { redirect } from 'next/navigation';
import { isSignupEnabled } from '@/lib/config';

export const metadata = {
  title: 'sign in — contract triage',
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect('/account');

  const signupOpen = isSignupEnabled();

  return (
    <main className="auth-page">
      <p className="legal-back">
        <Link href="/">← back to the demo</Link>
      </p>

      <h1>Sign in</h1>
      <p className="auth-blurb">
        Enter your email and I'll send you a sign-in link. No password to
        remember, no account to create — just one click in your inbox.
      </p>

      {!signupOpen ? (
        <div className="demo-paused-banner">
          <strong>Signups are paused right now.</strong> Check back soon, or
          drop Chris a line at{' '}
          <a href="mailto:chris@handsonwith.ai">chris@handsonwith.ai</a>.
        </div>
      ) : (
        <form
          className="auth-form"
          action={async (formData) => {
            'use server';
            await signIn('resend', formData);
          }}
        >
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="auth-input"
          />
          <button type="submit" className="auth-submit">
            send sign-in link
          </button>
        </form>
      )}

      <p className="auth-tos">
        By signing in you agree to the{' '}
        <Link href="/terms">terms of use</Link> and{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </main>
  );
}
