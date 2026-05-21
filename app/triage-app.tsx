'use client';

import { useCallback, useState } from 'react';
import type { Sample, TriageReport } from '@/lib/types';
import { Report } from './report';

export function TriageApp({
  samples,
  demoEnabled,
}: {
  samples: Sample[];
  demoEnabled: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string>(samples[0]?.id ?? '');
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<TriageReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSample = samples.find((s) => s.id === selectedId);

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
        body: JSON.stringify({ contractText: selectedSample.text }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `Request failed: ${res.status}`);
      }
      const result = (await res.json()) as TriageReport;
      setReport(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }, [selectedSample]);

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
          <a href="https://handsonwith.ai">hands on with.ai</a>{' '}·{' '}
          <a href="https://github.com/PhilSpiderman/contract-triage">view source</a>
        </p>
      </header>

      <section>
        <h2 className="section-title">Pick a sample contract</h2>
        <div className="sample-list">
          {samples.map((s) => {
            const selected = selectedId === s.id;
            return (
              <button
                key={s.id}
                className={`sample-card ${selected ? 'selected' : ''}`}
                onClick={() => handleSelectSample(s.id)}
                aria-pressed={selected}
              >
                <div className="sample-id">{s.id}</div>
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

      <section className="analyze-section">
        <button
          className="analyze-button"
          disabled={analyzing || !selectedSample || !demoEnabled}
          onClick={handleAnalyze}
        >
          {analyzing ? 'analysing…' : 'analyse contract'}
        </button>
        {analyzing && (
          <p className="analyze-hint">
            ~15–20 seconds — calling Claude with the cached playbook
          </p>
        )}
      </section>

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
          <a href="https://handsonwith.ai">Chris @ hands on with.ai</a>{' '}·{' '}
          <a href="https://github.com/PhilSpiderman/contract-triage">view source</a>
        </p>
        <p className="footer-legal">
          <a href="/privacy">privacy</a> · <a href="/terms">terms</a>
        </p>
      </footer>
    </main>
  );
}
