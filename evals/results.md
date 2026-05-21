# Eval results

_Generated: 2026-05-21 18:05:59 UTC_

## Summary

| Metric | Value |
|---|---|
| Verdict accuracy | **5/5** |
| Expected-flag recall | **9/9** (100%) |
| Extra flags surfaced (model > ground truth) | 3 |
| Total wall-clock | 118.5s |
| Tokens in / out (across 5 calls) | 5,196 / 7,087 |
| Cache: written / read | 2,965 / 11,860 |

## Per-sample

| # | Sample | Actual verdict | Match | Expected flags | Caught | Missed | Extra (model-surfaced) |
|---|---|---|---|---|---|---|---|
| 1 | `01-clean-nda` | standard | ✓ | — | — | — | — |
| 2 | `02-mild-deviation-nda` | minor_deviation | ✓ | 1 | `confidentiality_term` | — | — |
| 3 | `03-mild-deviation-order` | minor_deviation | ✓ | 1 | `term` | — | — |
| 4 | `04-needs-human-vendor` | needs_human | ✓ | 5 | `governing_law`, `term`, `liability_cap`, `payment_terms`, `exclusivity` | — | `termination` |
| 5 | `05-needs-human-weird` | needs_human | ✓ | 2 | `ip_ownership`, `confidentiality_term` | — | `termination`, `liability_cap` |

## Methodology

The harness loads `evals/expected.yaml` (ground truth set by the author before running the model), executes each sample through the live pipeline, and compares the structured output against expectations. Three metrics are tracked:

- **Verdict accuracy** — did the overall verdict (`standard` / `minor_deviation` / `needs_human`) match.
- **Expected-flag recall** — of the flags the author anticipated, how many the model caught.
- **Extra flags surfaced** — flags the model raised that were not in `expected.yaml`. These are reported separately rather than counted as false positives. On review during development, the author concluded the model's reads were defensible (e.g. catching a missing termination clause that the author had overlooked when writing ground truth).

The harness is non-deterministic — Anthropic's API uses a default temperature of 1.0, so individual flags and wording vary between runs. The headline metrics (verdict accuracy, recall) have been stable across runs observed during development.

Run with: `npm run evals`
