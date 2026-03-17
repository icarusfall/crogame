import type { Scenario, ConditionalModifier, Precondition, ScoreImpact } from '../types/scenario.js';

export function applyCompoundingEffects(
  state: Record<string, string | number | boolean>,
  effects: ConditionalModifier[],
): Record<string, string | number | boolean> {
  const updated = { ...state };

  for (const effect of effects) {
    const existing = updated[effect.key];

    // If key ends with _count, treat as additive counter
    if (effect.key.endsWith('_count') && typeof effect.value === 'number') {
      updated[effect.key] = (typeof existing === 'number' ? existing : 0) + effect.value;
    } else {
      updated[effect.key] = effect.value;
    }
  }

  return updated;
}

/**
 * Simple condition evaluator for compounding state.
 * Supports:
 *   "key === value"
 *   "key !== value"
 *   "key > number"
 *   "key >= number"
 *   "key < number"
 *   "key <= number"
 *   "key" (truthy check)
 */
export function evaluateCondition(
  condition: string,
  state: Record<string, string | number | boolean>,
): boolean {
  const trimmed = condition.trim();

  // Try comparison operators (order matters: check >= before >)
  const comparisonMatch = trimmed.match(/^(\w+)\s*(===|!==|>=|<=|>|<)\s*(.+)$/);
  if (comparisonMatch) {
    const [, key, operator, rawValue] = comparisonMatch;
    const stateValue = state[key];

    // Parse the comparison value
    let compareValue: string | number | boolean;
    const trimmedValue = rawValue.trim();
    if (trimmedValue === 'true') compareValue = true;
    else if (trimmedValue === 'false') compareValue = false;
    else if (!isNaN(Number(trimmedValue))) compareValue = Number(trimmedValue);
    else compareValue = trimmedValue.replace(/^["']|["']$/g, ''); // strip quotes

    switch (operator) {
      case '===': return stateValue === compareValue;
      case '!==': return stateValue !== compareValue;
      case '>': return typeof stateValue === 'number' && stateValue > (compareValue as number);
      case '>=': return typeof stateValue === 'number' && stateValue >= (compareValue as number);
      case '<': return typeof stateValue === 'number' && stateValue < (compareValue as number);
      case '<=': return typeof stateValue === 'number' && stateValue <= (compareValue as number);
    }
  }

  // Simple truthy check: just the key name
  if (/^\w+$/.test(trimmed)) {
    const val = state[trimmed];
    return val !== undefined && val !== false && val !== 0 && val !== '';
  }

  return false;
}

export function resolveScenarioPreconditions(
  scenario: Scenario,
  compoundingState: Record<string, string | number | boolean>,
): Scenario {
  // Deep clone the scenario to avoid mutation
  const resolved: Scenario = JSON.parse(JSON.stringify(scenario));

  for (const precondition of resolved.preconditions) {
    const stateValue = compoundingState[precondition.key];
    if (stateValue === undefined || stateValue === false || stateValue === 0 || stateValue === '') {
      continue; // Precondition not triggered
    }

    // Apply setup text modifier
    if (precondition.setup_text_modifier) {
      resolved.setup_text = precondition.setup_text_modifier;
    }

    // Apply option modifiers
    if (precondition.option_modifiers) {
      for (const mod of precondition.option_modifiers) {
        const option = resolved.options.find(o => o.id === mod.option_id);
        if (!option) continue;

        // Merge consequence adjustments
        const adj = mod.consequence_adjustments;
        if (adj.solvency_ratio) option.consequences.solvency_ratio = (option.consequences.solvency_ratio ?? 0) + adj.solvency_ratio;
        if (adj.cumulative_pnl) option.consequences.cumulative_pnl = (option.consequences.cumulative_pnl ?? 0) + adj.cumulative_pnl;
        if (adj.regulatory_standing) option.consequences.regulatory_standing = (option.consequences.regulatory_standing ?? 0) + adj.regulatory_standing;
        if (adj.reputation) option.consequences.reputation = (option.consequences.reputation ?? 0) + adj.reputation;
        if (adj.board_confidence) option.consequences.board_confidence = (option.consequences.board_confidence ?? 0) + adj.board_confidence;

        // Override narrative if provided
        if (mod.narrative_override) {
          option.narrative_snippet = mod.narrative_override;
        }
      }
    }
  }

  return resolved;
}

/**
 * Substitute template variables like {variable_name} in text
 */
export function substituteTemplateVars(
  text: string,
  params: Record<string, number | boolean | string>,
): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    if (value === undefined) return match;
    if (typeof value === 'number') {
      // Format numbers nicely
      if (Number.isInteger(value)) return value.toLocaleString();
      return value.toFixed(1);
    }
    return String(value);
  });
}
