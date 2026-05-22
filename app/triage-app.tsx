'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Sample, TriageReport } from '@/lib/types';
import { Report } from './report';
import { signOutAction } from './actions';

interface Props {
  samples: Sample[];
  demoEnabled: boolean;
  signedIn: boolean;
  userEmail: string | null;
  analysedSampleIds: string[];
}

export function TriageApp({
  samples,
  demoEnabled,
  signedIn,
  userEmail,
  analysedSampleIds,
}: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(samples[0]?.id ?? '');
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<TriageReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSample = samples.find((s) => s.id === selectedId);
  const remaining = samples.length - analysedSampleIds.length;
  const allUsed = remaining === 0;
  const selectedAlreadyAnalysed = selectedSample
    ? analysedSampleIds.includes(selectedSample.id)
    : false;

  const handleSelectSample = (id: string) => {
    setSelectedId(id);
    setReport(null);
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!selectedSample) return;
    setAnalyzing(true);
    setReport(null);
    setError(null);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: selectedSample.id }),
      });
      if (!res.ok) {
        const errBody = (await res
          .json()
          .catch(() => ({}))) as { error?: string; code?: string };
        if (errBody.code === 'UNAUTHENTICATED') {
          window.location.href = '/signin';
          return;
        }
        throw new Error(errBody.error ?? `Request failed: ${res.status}`);
      }
      const result = (await res.json()) as TriageReport;
      setReport(result);
      // Refresh server-rendered data so analysedSampleIds picks up the new entry
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }, [selectedSample, router]);

  const analyseDisabled =
    analyzing ||
    !selectedSample ||
    !demoEnabled ||
    !signedIn ||
    selectedAlreadyAnalysed ||
    allUsed;

  return (
    <main className="page">
      <header className="hero">
        <h1>contract triage</h1>
        <p className="tagline">
          A small AI demo. Pick a sample commercial contract and get back a
          structured triage report against a playbook of preferred positions —
          which clauses match, which deviate, and what redline to propose.
        </p>
        <p className="sub">
          Built by Chris at{' '}
          <a href="https://handsonwith.ai">hands on with.ai</a> ·{' '}
          <a href="https://github.com/PhilSpiderman/contract-triage">view source</a>
        </p>
      </header>

      <section className="auth-status">
        {!signedIn ? (
          <Link href="/signin" className="auth-status-cta">
            sign in to use the demo →
          </Link>
        ) : (
          <>
            signed in as <strong>{userEmail}</strong>
            {' · '}
            {allUsed
              ? 'all 5 uses spent'
              : `${remaining} of ${samples.length} uses remaining`}
            {' · '}
            <form action={signOutAction} className="inline-form">
              <button type="submit" className="text-link">
                sign out
              </button>
            </form>
          </>
        )}
      </section>

      <section>
        <h2 className="section-title">Pick a sample contract</h2>
        <div className="sample-list">
          {samples.map((s) => {
            const selected = selectedId === s.id;
            const used = analysedSampleIds.includes(s.id);
            return (
              <button
                key={s.id}
                className={`sample-card ${selected ? 'selected' : ''} ${used ? 'analysed' : ''}`}
                onClick={() => handleSelectSample(s.id)}
                aria-pressed={selected}
              >
                <div className="sample-card-top">
                  <div className="sample-id">{s.id}</div>
                  {used && <span className="sample-badge">analysed</span>}
                </div>
                <div className="sample-title">{s.title}</div>
                <div className="sample-desc">{s.description}</div>
              </button>
            );
          })}
        </div>

        <p className="upload-note">
          <strong>Want to try your own contract?</strong> Uploading is on the v2
          list — this demo only runs on the fictitious samples above.
          Real-document upload is a personal-data processing surface that needs
          a privacy policy and DPIA first.
        </p>
      </section>

      {!demoEnabled && (
        <section className="demo-paused-banner">
          <strong>Demo is paused right now.</strong> Analysis is temporarily
          disabled — check back soon, or drop Chris a line at{' '}
          <a href="mailto:chris@handsonwith.ai">chris@handsonwith.ai</a>.
        </section>
      )}

      {demoEnabled && signedIn && allUsed && (
        <section className="all-used-banner">
          <strong>You've seen the full demo.</strong> If you'd like to talk
          about your own contracts (or any other AI work), drop Chris a line
          at <a href="mailto:chris@handsonwith.ai">chris@handsonwith.ai</a>.
        </section>
      )}

      {demoEnabled && !allUsed && (
        <section className="analyze-section">
          <button
            className="analyze-button"
            disabled={analyseDisabled}
            onClick={handleAnalyze}
          >
            {analyzing
              ? 'analysing…'
              : !signedIn
                ? 'sign in to analyse'
                : selectedAlreadyAnalysed
                  ? "you've analysed this one"
                  : 'analyse contract'}
          </button>
          {analyzing && (
            <p className="analyze-hint">
              ~15–20 seconds — calling Claude with the cached playbook
            </p>
          )}
        </section>
      )}

      {error && (
        <section className="error">
          <strong>Something went wrong:</strong> {error}
        </section>
      )}

      {report && (
        <section className="report-section">
          <Report
            report={report}
            sourceLabel={selectedSample?.title ?? selectedId}
          />
        </section>
      )}

      <footer className="footer">
        <p>
          A working example by{' '}
          <a href="https://handsonwith.ai">Chris @ hands on with.ai</a> ·{' '}
          <a href="https://github.com/PhilSpiderman/contract-triage">view source</a>
        </p>
        <p className="footer-legal">
          <a href="/privacy">privacy</a> · <a href="/terms">terms</a>
        </p>
      </footer>
    </main>
  );
}
