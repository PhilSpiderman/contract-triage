export type OverallVerdict = 'standard' | 'minor_deviation' | 'needs_human';

export type ClauseVerdict = 'matches' | 'acceptable' | 'deviates' | 'missing';

export interface PlaybookClause {
  id: string;
  label: string;
  preferred: string;
  acceptable?: string[];
  redline_if: string[];
  standard_redline: string;
  rationale: string;
}

export interface Playbook {
  version: string;
  clauses: PlaybookClause[];
}

export interface ClauseAnalysis {
  clause_id: string;
  found_in_contract: boolean;
  contract_excerpt?: string;
  verdict: ClauseVerdict;
  notes: string;
  suggested_redline?: string;
}

export interface TriageReport {
  overall_verdict: OverallVerdict;
  summary: string;
  clause_analyses: ClauseAnalysis[];
  flags: string[];
  unflagged_observations?: string[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
}

export interface SampleMeta {
  id: string;
  title: string;
  description: string;
}

export interface Sample extends SampleMeta {
  text: string;
}
