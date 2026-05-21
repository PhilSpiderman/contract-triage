import Anthropic from '@anthropic-ai/sdk';
import { playbookAsYaml } from './playbook';
import type { TriageReport } from './types';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 4096;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    client = new Anthropic();
  }
  return client;
}

const TRIAGE_TOOL = {
  name: 'submit_triage_report',
  description:
    'Submit a structured triage report for the contract against the playbook.',
  input_schema: {
    type: 'object' as const,
    properties: {
      overall_verdict: {
        type: 'string',
        enum: ['standard', 'minor_deviation', 'needs_human'],
        description:
          'standard = matches playbook with no notable issues; minor_deviation = 1-2 small flags within or close to acceptable variations; needs_human = significant departures, multiple redlines, or material risk warranting lawyer review.',
      },
      summary: {
        type: 'string',
        description: 'One or two sentence executive summary for the reviewer.',
      },
      clause_analyses: {
        type: 'array',
        description:
          'One entry per playbook clause. Cover every clause, even if it is missing from the contract.',
        items: {
          type: 'object',
          properties: {
            clause_id: {
              type: 'string',
              description: 'The id from the playbook (e.g. "governing_law").',
            },
            found_in_contract: {
              type: 'boolean',
              description: 'Whether the clause appears in the contract at all.',
            },
            contract_excerpt: {
              type: 'string',
              description:
                'A short verbatim excerpt from the contract showing the relevant text. Omit if the clause is missing.',
            },
            verdict: {
              type: 'string',
              enum: ['matches', 'acceptable', 'deviates', 'missing'],
              description:
                'matches = aligns with preferred wording; acceptable = falls within an acceptable variation; deviates = triggers a redline condition; missing = clause not present in contract.',
            },
            notes: {
              type: 'string',
              description:
                'Short plain-English note explaining the verdict. For deviations, describe specifically what differs from the playbook.',
            },
            suggested_redline: {
              type: 'string',
              description:
                'If verdict is "deviates", the redline wording you would propose (drawing on the playbook\'s standard_redline where appropriate). Omit for other verdicts.',
            },
          },
          required: ['clause_id', 'found_in_contract', 'verdict', 'notes'],
        },
      },
      flags: {
        type: 'array',
        items: { type: 'string' },
        description:
          'List of clause_ids that need attention (verdict = deviates, or missing where missing is material).',
      },
      unflagged_observations: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Optional list of notable observations about the contract that fall outside the playbook (e.g. unusual clauses, formatting concerns).',
      },
    },
    required: ['overall_verdict', 'summary', 'clause_analyses', 'flags'],
  },
};

function systemPrompt(): string {
  return `You are a contract triage assistant for a small in-house legal team at a UK SMB. Your job is to compare an incoming commercial contract against the company's playbook of preferred positions and produce a structured triage report.

For each clause in the playbook, locate the corresponding provision in the contract (if any) and judge whether it: matches the preferred position, falls within an acceptable variation, deviates (triggering a redline), or is missing entirely.

Then assign an overall verdict:
- standard: every clause matches or is acceptable; nothing for a human to look at
- minor_deviation: one or two flags, all within or near acceptable variations
- needs_human: multiple deviations, a single severe deviation (e.g. uncapped liability, IP transfer, exclusivity, foreign jurisdiction), or significant missing clauses

Be terse and factual in notes. Quote contract text verbatim in excerpts. Do not invent text that isn't in the contract.

Call the submit_triage_report tool with your analysis. Do not return prose responses.

---

PLAYBOOK:

${playbookAsYaml()}`;
}

export async function analyseContract(
  contractText: string,
): Promise<TriageReport> {
  const c = getClient();

  const response = await c.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: systemPrompt(),
        cache_control: { type: 'ephemeral' },
      },
    ],
    tools: [TRIAGE_TOOL],
    tool_choice: { type: 'tool', name: 'submit_triage_report' },
    messages: [
      {
        role: 'user',
        content: `Please analyse the following contract against the playbook and call submit_triage_report.\n\n---\n\n${contractText}`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Model did not call submit_triage_report tool');
  }

  const report = toolUse.input as TriageReport;
  report.usage = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
    cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
  };

  return report;
}
