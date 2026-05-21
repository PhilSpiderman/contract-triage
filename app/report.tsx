'use client';

import { useState } from 'react';
import type { ClauseAnalysis, ClauseVerdict, OverallVerdict, TriageReport } from '@/lib/types';

const VERDICT_STYLE: Record<OverallVerdict, { label: string; bg: string; text: string }> = {
  standard: {
    label: 'standard',
    bg: 'var(--green-bg)',
    text: 'var(--green-text)',
  },
  minor_deviation: {
    label: 'minor deviation',
    bg: 'var(--amber-bg)',
    text: 'var(--amber-text)',
  },
  needs_human: {
    label: 'needs human',
    bg: 'var(--red-bg)',
    text: 'var(--red-text)',
  },
};

const CLAUSE_MARKER: Record<ClauseVerdict, string> = {
  matches: '✓',
  acceptable: '~',
  deviates: '✗',
  missing: '?',
};

export function Report({
  report,
  sourceLabel,
}: {
  report: TriageReport;
  sourceLabel: string;
}) {
  const verdict = VERDICT_STYLE[report.overall_verdict];

  return (
    <div className="report">
      <div className="report-header">
        <div className="report-source">contract: {sourceLabel}</div>
        <div
          className="verdict-pill"
          style={{ background: verdict.bg, color: verdict.text }}
        >
          {verdict.label}
        </div>
      </div>

      <p className="report-summary">{report.summary}</p>

      {report.flags.length > 0 && (
        <div className="report-flags">
          <span className="report-flags-label">flagged:</span>
          {report.flags.map((f) => (
            <span key={f} className="flag-pill">
              {f}
            </span>
          ))}
        </div>
      )}

      <h3 className="clauses-heading">clause by clause</h3>
      <div className="clauses">
        {report.clause_analyses.map((c) => (
          <ClauseRow key={c.clause_id} clause={c} />
        ))}
      </div>

      {report.unflagged_observations && report.unflagged_observations.length > 0 && (
        <div className="observations">
          <h3>other observations</h3>
          <ul>
            {report.unflagged_observations.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {report.usage && (
        <div className="usage">
          tokens: {report.usage.input_tokens.toLocaleString()} in /{' '}
          {report.usage.output_tokens.toLocaleString()} out
          {(report.usage.cache_read_input_tokens ?? 0) > 0 &&
            ` · ${report.usage.cache_read_input_tokens?.toLocaleString()} from cache`}
          {(report.usage.cache_creation_input_tokens ?? 0) > 0 &&
            ` · ${report.usage.cache_creation_input_tokens?.toLocaleString()} written to cache`}
        </div>
      )}
    </div>
  );
}

function ClauseRow({ clause }: { clause: ClauseAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = Boolean(clause.contract_excerpt || clause.suggested_redline);
  const marker = CLAUSE_MARKER[clause.verdict];

  return (
    <div className={`clause-row clause-${clause.verdict}`}>
      <div
        className="clause-summary"
        onClick={() => hasDetail && setExpanded(!expanded)}
        role={hasDetail ? 'button' : undefined}
        tabIndex={hasDetail ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasDetail && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <span className="clause-marker">{marker}</span>
        <span className="clause-id">{clause.clause_id}</span>
        <span className="clause-verdict-badge">{clause.verdict}</span>
        <span className="clause-notes">{clause.notes}</span>
        {hasDetail && (
          <span className="clause-expand">{expanded ? '−' : '+'}</span>
        )}
      </div>

      {expanded && (
        <div className="clause-detail">
          {clause.contract_excerpt && (
            <>
              <span className="detail-label">from contract</span>
              <blockquote>{clause.contract_excerpt}</blockquote>
            </>
          )}
          {clause.suggested_redline && (
            <>
              <span className="detail-label">suggested redline</span>
              <blockquote>{clause.suggested_redline}</blockquote>
            </>
          )}
        </div>
      )}
    </div>
  );
}
