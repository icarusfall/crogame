import type { Option, SubChoice, Scenario } from '../types/scenario.js';
import type { GameSession } from '../types/session.js';
import { substituteTemplateVars } from './compounding-engine.js';
import { evaluateCondition } from './compounding-engine.js';
import { STRATEGY_LABELS } from '../data/strategy-definitions.js';
import { determineTenureTitle } from '../data/tenure-titles.js';

/**
 * Assemble a narrative snippet for a single decision.
 * Substitutes template variables and evaluates conditional narratives.
 */
export function assembleNarrativeSnippet(
  option: Option | SubChoice,
  rolledParams: Record<string, number | boolean | string>,
  compoundingState: Record<string, string | number | boolean>,
  scenario: Scenario,
  year: number,
): string {
  const parts: string[] = [];

  // Year and scenario header
  parts.push(`**Year ${year} — ${scenario.title}**`);

  // Base narrative snippet with template substitution
  const allVars = { ...rolledParams };
  // Also include compounding state values that might be referenced
  for (const [k, v] of Object.entries(compoundingState)) {
    if (!(k in allVars)) {
      allVars[k] = v;
    }
  }

  let snippet = substituteTemplateVars(option.narrative_snippet, allVars);
  parts.push(snippet);

  // Conditional narratives
  if (option.conditional_narrative) {
    for (const cn of option.conditional_narrative) {
      // Check condition against both rolled params and compounding state
      const combinedState: Record<string, string | number | boolean> = {
        ...compoundingState,
      };
      for (const [k, v] of Object.entries(rolledParams)) {
        combinedState[k] = v;
      }

      if (evaluateCondition(cn.condition, combinedState)) {
        parts.push(substituteTemplateVars(cn.snippet, allVars));
      }
    }
  }

  return parts.join('\n\n');
}

/**
 * Assemble the full narrative from all decision snippets.
 */
export function assembleFullNarrative(session: GameSession): string {
  const parts: string[] = [];

  // Opening
  const strategyLabel = STRATEGY_LABELS[session.strategy];
  parts.push(
    `You took the helm at Steadfast Group as Chief Risk Officer, declaring yourself "${strategyLabel}." ` +
    `What followed was a tenure that would be talked about — for better or worse — for years to come.`,
  );

  parts.push('---');

  // Decision narratives (already assembled with year headers)
  for (const snippet of session.narrative_parts) {
    parts.push(snippet);
  }

  parts.push('---');

  // Closing
  if (session.tenure_title) {
    parts.push(`**Your tenure title: "${session.tenure_title}"**`);
  }

  const scores = session.scores;
  parts.push(
    `After five years, Steadfast Group's solvency ratio stood at ${scores.solvency_ratio.toFixed(0)}%. ` +
    `Cumulative P&L: £${scores.cumulative_pnl.toFixed(0)}m. ` +
    `Regulatory standing: ${scores.regulatory_standing}. ` +
    `Reputation: ${scores.reputation}/100. ` +
    `Board confidence: ${scores.board_confidence}/100.`,
  );

  if (session.luck_factor !== undefined) {
    const luckDesc =
      session.luck_factor > 0.3
        ? 'Fortune smiled on you'
        : session.luck_factor < -0.3
          ? 'The dice were not kind'
          : 'Your luck was about average';
    parts.push(`${luckDesc} (luck factor: ${(session.luck_factor * 100).toFixed(0)}%).`);
  }

  return parts.join('\n\n');
}
