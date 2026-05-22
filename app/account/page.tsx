import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { getLeadProfile } from '@/lib/leads';

export const metadata = {
  title: 'your account — contract triage',
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/signin');

  const profile = await getLeadProfile(session.user.id);

  return (
    <main className="auth-page">
      <p className="legal-back">
        <Link href="/">← back to the demo</Link>
      </p>

      <h1>Your account</h1>
      <p className="auth-blurb">
        Signed in as <strong>{session.user.email}</strong>
        {profile?.name ? <> ({profile.name})</> : null}.
      </p>

      {profile && (
        <div className="auth-profile">
          <h2 className="auth-profile-heading">What I have on file</h2>
          <dl className="auth-profile-dl">
            <dt>Name</dt>
            <dd>{profile.name || '—'}</dd>
            <dt>Follow-up consent</dt>
            <dd>{profile.consent_follow_up ? 'yes' : 'no'}</dd>
            {profile.consent_follow_up && (
              <>
                <dt>What you do</dt>
                <dd>{profile.role || '—'}</dd>
                <dt>What brought you here</dt>
                <dd>{profile.context || '—'}</dd>
              </>
            )}
          </dl>
        </div>
      )}

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
