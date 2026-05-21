import Link from 'next/link';

export const metadata = {
  title: 'check your email — contract triage',
};

export default function CheckEmailPage() {
  return (
    <main className="auth-page">
      <p className="legal-back">
        <Link href="/">← back to the demo</Link>
      </p>

      <h1>Check your email</h1>
      <p className="auth-blurb">
        I've sent you a sign-in link. Open the email and click the button to
        come back here, signed in.
      </p>
      <p className="auth-blurb auth-muted">
        Can't find it? Check your spam folder. The email comes from{' '}
        <code>noreply@get.handsonwith.ai</code>.
      </p>
      <p className="auth-blurb auth-muted">
        The link expires in 24 hours.
      </p>
    </main>
  );
}
