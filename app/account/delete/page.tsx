import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { deleteUserAndAllData } from '@/lib/account-delete';
import { DeleteAccountForm, type DeleteFormState } from './delete-form';

export const metadata = {
  title: 'delete your account — contract triage',
};

export default async function DeleteAccountPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect('/signin');

  const userId = session.user.id;
  const email = session.user.email;

  async function deleteAction(
    _prev: DeleteFormState | null,
    formData: FormData,
  ): Promise<DeleteFormState> {
    'use server';

    const typed = String(formData.get('confirmEmail') ?? '').trim().toLowerCase();
    if (!typed) {
      return { error: 'Please type your email to confirm.' };
    }
    if (typed !== email.toLowerCase()) {
      return { error: "That doesn't match the email on file." };
    }

    await deleteUserAndAllData(userId, email);
    await signOut({ redirectTo: '/' });
    // signOut throws a redirect; this return is unreachable but satisfies TS.
    return {};
  }

  return (
    <main className="auth-page">
      <p className="legal-back">
        <Link href="/account">← back to your account</Link>
      </p>

      <h1>Delete your account</h1>

      <p className="auth-blurb">
        This is permanent. There's no recovery once you confirm.
      </p>

      <div className="auth-profile">
        <h2 className="auth-profile-heading">What gets deleted</h2>
        <ul className="auth-delete-list">
          <li>Your sign-in record ({email})</li>
          <li>Any name, role and "what brought you here" you shared at signup</li>
          <li>Your record of which samples you've analysed</li>
          <li>Your active session — you'll be signed out</li>
        </ul>
        <p className="auth-blurb auth-muted">
          The cached analysis results themselves are stored globally by sample
          and don't reference you — they stay so other users don't repeat
          paid analyses.
        </p>
      </div>

      <DeleteAccountForm email={email} action={deleteAction} />
    </main>
  );
}
