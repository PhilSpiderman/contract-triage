import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'terms of use — contract triage',
  description: 'Terms of use for the contract triage demo by Chris Green of Hands On With.ai.',
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <p className="legal-back">
        <Link href="/">← back to the demo</Link>
      </p>

      <div className="legal-draft-banner">
        <strong>Working draft.</strong> This is a first-pass document and will
        be revised against ICO guidance before the demo goes publicly live.
      </div>

      <h1>Terms of use</h1>
      <p className="legal-meta">Last updated: 21 May 2026 · status: draft</p>

      <p>
        This is a free demo built by me, Chris, to show what a small AI
        contract-triage tool can do. By using it you agree to the following.
        Plain English, no surprises.
      </p>

      <h2>What this is</h2>
      <p>
        The contract triage demo is a working example — not a product, not a
        service, not a substitute for legal advice. The sample contracts are
        fictitious. The analysis is produced by Claude, an AI from Anthropic,
        against a playbook I wrote. Treat the output as illustrative.
      </p>

      <h2>Acceptable use</h2>
      <p>You're welcome to use the demo to see how the tool works. I'd ask that you:</p>
      <ul>
        <li>
          Don't try to overload the service, script abusive requests, or
          attempt to extract API credentials.
        </li>
        <li>
          Don't share your account with others — sign-up is per-person.
        </li>
        <li>Don't impersonate someone else when signing up.</li>
      </ul>
      <p>
        If you do any of the above, I'll revoke your access without notice.
      </p>

      <h2>Not legal advice</h2>
      <p>
        The AI's output is not legal advice. It is the output of a
        probabilistic model matching contract text against a generic playbook.
        Don't make a decision about a real contract based on anything this
        demo says. If you have a real contract that needs reviewing, talk to a
        lawyer.
      </p>

      <h2>No warranty</h2>
      <p>
        The demo is provided "as is". It might be slow. It might be wrong. It
        might be temporarily down. I make no promises about availability,
        accuracy, fitness for any purpose, or anything else.
      </p>

      <h2>Limit of liability</h2>
      <p>
        To the maximum extent permitted by UK law, I have no liability for any
        loss arising from your use of the demo. This does not limit liability
        for matters that cannot be limited by law (death or personal injury
        caused by negligence, fraud, and so on).
      </p>

      <h2>Termination</h2>
      <p>
        I can shut down the demo, change it, or revoke your access at any time
        for any reason. If I shut it down entirely, you will no longer be able
        to log in. What happens to your personal data after that is governed
        by the privacy policy — broadly: service data (your account and demo
        usage) follows the 12-month inactivity rule, and any follow-up consent
        data you provided is retained until you withdraw consent.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of England and Wales. Any
        disputes go to the exclusive jurisdiction of the English courts.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:privacy@handsonwith.ai">privacy@handsonwith.ai</a>
      </p>

      <footer className="legal-footer">
        <Link href="/">demo</Link> · <Link href="/privacy">privacy</Link> ·{' '}
        <a href="https://handsonwith.ai">hands on with.ai</a>
      </footer>
    </main>
  );
}
