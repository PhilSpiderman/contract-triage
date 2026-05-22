'use client';

import { useState } from 'react';

export function SignupForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [consent, setConsent] = useState(false);

  return (
    <form className="auth-form" action={action}>
      <div className="auth-field">
        <label htmlFor="email" className="auth-label">
          Email <span className="auth-required">*</span>
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
      </div>

      <div className="auth-field">
        <label htmlFor="name" className="auth-label">
          Your name <span className="auth-optional">optional</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="given-name"
          placeholder="first name is fine"
          className="auth-input"
        />
      </div>

      <div className="auth-consent">
        <label className="auth-consent-label">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="auth-checkbox"
          />
          <span>
            I'd be happy for Chris to follow up about AI work for my business.
          </span>
        </label>

        {consent && (
          <div className="auth-consent-fields">
            <p className="auth-consent-intro">
              If you're happy with that, tell me a little about yourself
              (optional):
            </p>

            <div className="auth-field">
              <label htmlFor="role" className="auth-label">
                What do you do?
              </label>
              <input
                id="role"
                name="role"
                type="text"
                placeholder="e.g. partner at a small law firm"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="context" className="auth-label">
                What brought you here?
              </label>
              <textarea
                id="context"
                name="context"
                rows={3}
                placeholder="what's the problem you're hoping AI could solve?"
                className="auth-input auth-textarea"
              />
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="auth-submit">
        send me a sign-in link
      </button>
    </form>
  );
}
