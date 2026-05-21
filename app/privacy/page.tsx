import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'privacy policy — contract triage',
  description: 'How Chris Green of Hands On With.ai handles personal data for the contract triage demo.',
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <p className="legal-back">
        <Link href="/">← back to the demo</Link>
      </p>

      <div className="legal-draft-banner">
        <strong>Working draft.</strong> This is a first-pass document and will
        be revised against ICO guidance before the demo goes publicly live.
      </div>

      <h1>Privacy policy</h1>
      <p className="legal-meta">Last updated: 21 May 2026 · status: draft</p>

      <p>
        This explains what I do with the personal data of people who use the
        contract triage demo. Written by me, Chris, in plain English. If
        anything is unclear, email{' '}
        <a href="mailto:privacy@handsonwith.ai">privacy@handsonwith.ai</a>.
      </p>

      <h2>Who I am</h2>
      <p>
        The data controller is <strong>Chris Green of Hands On With.ai</strong>,
        a sole trader based in Cheshire, UK.
      </p>
      <ul>
        <li>
          Contact:{' '}
          <a href="mailto:privacy@handsonwith.ai">privacy@handsonwith.ai</a>
        </li>
        <li>
          ICO registration: <em>pending</em> — I will publish my registration
          number here once issued.
        </li>
      </ul>

      <h2>What I collect, and why</h2>
      <p>When you sign up to use the demo, I collect:</p>
      <ul>
        <li>
          <strong>Email address</strong> (required) — so I can send you the
          magic link to log in, and respond if you contact me.
        </li>
        <li>
          <strong>Name</strong> (optional) — so I can address you by name in any
          conversation.
        </li>
        <li>
          <strong>What you do / what brought you here</strong> (optional) — so I
          can understand who's interested in the demo and decide what to build
          next.
        </li>
        <li>
          <strong>A consent checkbox</strong> asking whether I can follow up
          with you about AI work for your business.
        </li>
      </ul>

      <p>I also automatically record:</p>
      <ul>
        <li>
          <strong>When you signed up, when you last used the demo, and how many
          times you've analysed each sample contract.</strong> Used to enforce
          per-account rate limits and to spot abuse patterns.
        </li>
      </ul>

      <p>
        I do not collect anything beyond the above. No tracking pixels, no
        Google Analytics, no behavioural profiling, no fingerprinting.
      </p>

      <h2>Lawful basis</h2>
      <ul>
        <li>
          <strong>Sending the magic link:</strong> legitimate interest — you
          asked to use the demo, and email is the only way to give you access.
        </li>
        <li>
          <strong>Storing the optional fields and follow-up consent:</strong>{' '}
          your explicit consent, given via the checkbox on the signup form. You
          can withdraw consent at any time.
        </li>
      </ul>

      <h2>How long I keep it</h2>
      <p>
        Twelve months from your last use of the demo. After that, your account
        and all associated data is deleted automatically —{' '}
        <strong>with one exception</strong>: if you ticked the follow-up consent
        box at signup, I separately retain the information you provided for
        that purpose (email, name if given, any optional context fields you
        completed, and the consent record itself), until you withdraw consent
        (which you can do at any time by emailing{' '}
        <a href="mailto:privacy@handsonwith.ai">privacy@handsonwith.ai</a>).
      </p>
      <p>
        If the demo is shut down entirely, the same rules apply — closing the
        service doesn't reset either clock.
      </p>
      <p>
        You can ask me to delete anything sooner — see "Your rights" below.
      </p>

      <h2>Who else sees your data</h2>
      <p>
        The demo runs on third-party infrastructure. The following services
        process some of your data on my behalf:
      </p>
      <ul>
        <li>
          <strong>Vercel</strong> — hosts the application. Servers in
          Frankfurt, EU.
        </li>
        <li>
          <strong>Upstash</strong> — provides the Redis database that stores
          your account record. Hosted in Frankfurt, EU.
        </li>
        <li>
          <strong>Resend</strong> — sends the magic-link email. They
          temporarily hold your email address and the message content.
        </li>
        <li>
          <strong>Cloudflare</strong> — provides the captcha that prevents bot
          signups. They process a token, not your identity.
        </li>
        <li>
          <strong>Anthropic</strong> — when you analyse a sample contract, the
          contract text and my playbook are sent to Anthropic's API for the AI
          to read. Your email address and name are <strong>not</strong> sent —
          only the contract content. Anthropic's commercial terms forbid them
          from training their models on this data.
        </li>
      </ul>
      <p>
        I have no other sub-processors. I do not sell, swap, rent or share your
        data with anyone for marketing.
      </p>

      <h2>Cookies</h2>
      <p>
        One cookie only — a session cookie that proves you've logged in. It is
        HTTP-only and SameSite=Lax. It contains a random session token, not
        your identity. It expires when you sign out or after 30 days of
        inactivity.
      </p>
      <p>No other cookies. No tracking.</p>

      <h2>Your rights under UK GDPR</h2>
      <p>You have the right to:</p>
      <ul>
        <li>
          <strong>Access</strong> — get a copy of what I hold about you
        </li>
        <li>
          <strong>Rectification</strong> — fix anything that's wrong
        </li>
        <li>
          <strong>Erasure</strong> — have your account and data deleted
        </li>
        <li>
          <strong>Object</strong> — to any of my processing
        </li>
        <li>
          <strong>Withdraw consent</strong> — if you previously consented to
          follow-up emails
        </li>
      </ul>
      <p>
        To exercise any of these, email{' '}
        <a href="mailto:privacy@handsonwith.ai">privacy@handsonwith.ai</a>. I'll
        respond within 30 days.
      </p>
      <p>
        You also have the right to complain to the Information Commissioner's
        Office at <a href="https://ico.org.uk">ico.org.uk</a> if you think I'm
        processing your data unfairly.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If I change anything material, I'll update this page and the
        "last updated" date at the top. Material changes that affect people
        already signed up will trigger an email.
      </p>

      <footer className="legal-footer">
        <Link href="/">demo</Link> · <Link href="/terms">terms</Link> ·{' '}
        <a href="https://handsonwith.ai">hands on with.ai</a>
      </footer>
    </main>
  );
}
