import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'your account — contract triage',
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect('/signin');

  return (
    <main className="auth-page">
      <p className="legal-back">
        <Link href="/">← back to the demo</Link>
      </p>

      <h1>Your account</h1>
      <p className="auth-blurb">
        Signed in as <strong>{session.user.email}</strong>.
      </p>
      <p className="auth-blurb auth-muted">
        Session expires after 30 days of inactivity. Account and all
        associated data is deleted 12 months from your last use of the demo —
        see the <Link href="/privacy">privacy policy</Link>.
      </p>

      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}
      >
        <button type="submit" className="auth-submit auth-submit-secondary">
          sign out
        </button>
      </form>
    </main>
  );
}
