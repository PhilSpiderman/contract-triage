'use client';

import { useActionState } from 'react';

export interface DeleteFormState {
  error?: string;
}

export function DeleteAccountForm({
  email,
  action,
}: {
  email: string;
  action: (
    prev: DeleteFormState | null,
    formData: FormData,
  ) => Promise<DeleteFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form className="auth-form" action={formAction}>
      <div className="auth-field">
        <label htmlFor="confirm-email" className="auth-label">
          Type <strong>{email}</strong> to confirm
        </label>
        <input
          id="confirm-email"
          name="confirmEmail"
          type="email"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder={email}
          className="auth-input"
        />
      </div>

      {state?.error && <div className="auth-error">{state.error}</div>}

      <button
        type="submit"
        className="auth-submit auth-submit-danger"
        disabled={isPending}
      >
        {isPending ? 'deleting…' : 'permanently delete my account'}
      </button>
    </form>
  );
}
