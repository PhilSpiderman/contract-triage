# TODO

A running list of items worth tracking — pre-launch compliance blockers first, then v2 ideas deliberately scoped out of v1.

---

## Pre-launch blockers

### ICO data protection fee — REQUIRED before public launch

The signup gate makes me a data controller under UK GDPR (collecting email + optional lead-capture fields, storing for up to 12 months). Under the Data Protection (Charges and Information) Regulations 2018, data controllers must register with the Information Commissioner's Office and pay the annual data protection fee.

- **Register at:** https://ico.org.uk/registration/new
- **Likely tier:** Tier 1 — £40/year (£35 with direct debit) for a sole trader / micro-org
- **Renewal:** annual
- **Penalty for non-payment:** up to £4,350 fine
- **Timing:** must be done before the signup form goes live — not before the Vercel deploy, but before the public URL is shared

This is independent of the privacy policy / ToS work — those describe how I process data; the ICO fee is the legal permission to be a data controller in the first place.

### Set up `privacy@handsonwith.ai` email alias

Configure `privacy@handsonwith.ai` as an alias forwarded to `chris@handsonwith.ai` (Google Workspace → Routing → Add alias). The privacy policy and ToS both list this as the contact address for data requests — needs to be live before public launch.

### Re-review privacy policy + ToS using the data protection skill

A separate Claude Code skill is being built that bakes in ICO guidance as a primary source. Once that skill exists, run both `/privacy` and `/terms` (and the wider data-handling architecture) through it for a more rigorous compliance review than the first-pass drafts I produced. Expect to revise wording, add anything missing, and align with whatever standard phrasing the skill enforces. Do this **before** the public URL goes live.

### Broaden the retention trigger in the privacy policy

Current wording in the privacy policy retention section says service data is deleted "12 months from your last use of the demo." Too narrow — starts the clock from when they stopped poking at the tool, ignoring genuine business interaction that should reset it too.

**Change to:** 12 months from the most recent of (a) last use of the demo, or (b) last meaningful business interaction (email exchange, scoping call, project work). The intent is to retain contact details for the natural lifetime of any real working relationship, not arbitrarily nuke leads who actively engaged via channels other than the demo itself.

**Files to update when implementing:**
- `app/privacy/page.tsx` → the "How long I keep it" section
- The cron-job design below needs a `last_active` field that updates on any recorded interaction, not just demo usage
- Probably worth a small "last interaction" timestamp on the user record, updateable by the admin view (Phase 11)

Re-review during the data-protection-skill pass — should be GDPR-defensible as long as the "meaningful interaction" definition is honest and documented.

### Cron job — auto-delete inactive accounts at 12 months

The privacy policy commits to deleting account data 12 months after last activity. Need a scheduled job to enforce this:

- Route: `/api/cron/cleanup-inactive`
- Logic: scan Vercel KV for user records where `last_active < (now - 12 months)`, delete them
- Schedule: daily, via Vercel Cron Jobs (entry in `vercel.json`)
- Auth: shared-secret header so only Vercel's scheduler can hit it

Add when building Phase 12 (account deletion).

---

## v2 ideas

### Spin-the-wheel contract generator

**Why this matters:** the current demo with 5 pre-baked samples is functional but underwhelming. A visitor can't actually tell whether our analysis is a live Claude call or a pre-computed cache — the "AI doing real work" is invisible. The demo doesn't show off the dynamic capability that's genuinely under the hood.

**The idea:**

1. User clicks "spin" — wheel animates, lands on something
2. The result seeds a contract-generation step (a separate Claude call)
3. We generate a fresh, plausible commercial contract on-the-fly with the seed as a prompt input
4. That generated contract is then analysed by the triage pipeline as normal
5. User sees both the generated contract and the analysis, both freshly produced

**Constraints worth holding:**

- **3 spins per user** instead of 5 static samples — keeps cost bounded, makes each spin feel scarce/valuable
- Generated contracts must read as **real commercial paperwork** — recognisable structure, plausible clauses, fictitious parties
- **Humour can be woven in** through party names, niche subject matter, oddly specific clauses — but it shouldn't undermine the "this looks like a real contract" plausibility

**Open design questions** (for when we tackle this):

- What goes on the wheel? Contract type categories (NDA / order form / vendor MSA / weird one-off)? Or themed mashups ("mutual NDA between a beekeeping cooperative and a competitor toymaker")?
- How does the wheel result map to the generation prompt? Pre-baked scenario library with parameter slots? Or fully open-ended prompt?
- **Two-call cost economics:** generate + analyse = double per-use spend. Worth running cost projections before committing.
- How do we **evaluate** generated outputs? Current eval set assumes static samples. Moving to generation means designing a separate harness for "did the generator produce a plausible contract" plus "did the triage match expectations on a generated input".
- Could one Claude call do both (generate + analyse in a single structured output)? Cheaper, but harder to display incrementally and to evaluate separately. Worth experimenting.

**Status:** noted, scoped out of v1. Revisit after public launch.
