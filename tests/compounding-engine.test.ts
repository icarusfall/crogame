import { describe, it, expect } from 'vitest';
import {
  applyCompoundingEffects,
  evaluateCondition,
  resolveScenarioPreconditions,
  substituteTemplateVars,
} from '../src/engine/compounding-engine.js';

describe('evaluateCondition', () => {
  it('evaluates truthy check', () => {
    expect(evaluateCondition('systems_funded', { systems_funded: true })).toBe(true);
    expect(evaluateCondition('systems_funded', { systems_funded: false })).toBe(false);
    expect(evaluateCondition('systems_funded', {})).toBe(false);
  });

  it('evaluates === comparison', () => {
    expect(evaluateCondition('yield_grab_leverage === true', { yield_grab_leverage: true })).toBe(true);
    expect(evaluateCondition('yield_grab_leverage === false', { yield_grab_leverage: false })).toBe(true);
    expect(evaluateCondition('yield_grab_choice === hold', { yield_grab_choice: 'hold' })).toBe(true);
  });

  it('evaluates !== comparison', () => {
    expect(evaluateCondition('status !== true', { status: false })).toBe(true);
  });

  it('evaluates numeric comparisons', () => {
    expect(evaluateCondition('private_credit_exposure > 0.3', { private_credit_exposure: 0.5 })).toBe(true);
    expect(evaluateCondition('private_credit_exposure > 0.3', { private_credit_exposure: 0.2 })).toBe(false);
    expect(evaluateCondition('conservative_choices_count >= 3', { conservative_choices_count: 3 })).toBe(true);
    expect(evaluateCondition('conservative_choices_count >= 3', { conservative_choices_count: 2 })).toBe(false);
    expect(evaluateCondition('further_gilt_move < 150', { further_gilt_move: 100 })).toBe(true);
  });

  it('returns false for missing keys in truthy check', () => {
    expect(evaluateCondition('nonexistent', {})).toBe(false);
  });
});

describe('applyCompoundingEffects', () => {
  it('sets simple values', () => {
    const result = applyCompoundingEffects({}, [
      { key: 'yield_grab_choice', value: 'hold' },
      { key: 'systems_funded', value: true },
    ]);
    expect(result.yield_grab_choice).toBe('hold');
    expect(result.systems_funded).toBe(true);
  });

  it('treats _count keys as additive', () => {
    const state = { conservative_choices_count: 2 };
    const result = applyCompoundingEffects(state, [
      { key: 'conservative_choices_count', value: 1 },
    ]);
    expect(result.conservative_choices_count).toBe(3);
  });

  it('initialises _count keys from zero', () => {
    const result = applyCompoundingEffects({}, [
      { key: 'conservative_choices_count', value: 1 },
    ]);
    expect(result.conservative_choices_count).toBe(1);
  });

  it('does not mutate original state', () => {
    const original = { key: 'value' as string | number | boolean };
    applyCompoundingEffects(original, [{ key: 'new_key', value: 'new' }]);
    expect(original).not.toHaveProperty('new_key');
  });
});

describe('substituteTemplateVars', () => {
  it('replaces variables in template text', () => {
    const result = substituteTemplateVars(
      'Sphinx outperformed by {sphinx_outperformance}bps',
      { sphinx_outperformance: 85 },
    );
    expect(result).toBe('Sphinx outperformed by 85bps');
  });

  it('leaves unmatched variables unchanged', () => {
    const result = substituteTemplateVars(
      'Value is {unknown}',
      {},
    );
    expect(result).toBe('Value is {unknown}');
  });

  it('formats large numbers with locale string', () => {
    const result = substituteTemplateVars(
      '{policies_affected} policies',
      { policies_affected: 85000 },
    );
    expect(result).toContain('85');
  });
});

describe('resolveScenarioPreconditions', () => {
  it('does not modify scenario when preconditions not triggered', () => {
    const scenario = {
      id: 'test',
      title: 'Test',
      category: 'market' as const,
      division: 'SAM' as const,
      year_range: [1, 2] as [number, number],
      is_tentpole: false,
      illustration_key: 'test',
      setup_text: 'Original text',
      random_params: {},
      options: [{
        id: 'opt1',
        label: 'Option 1',
        description: 'Desc',
        consequences: { solvency_ratio: -5 },
        narrative_snippet: 'Snippet',
        compounding_effects: [],
        strategy_alignment: 'balanced' as const,
      }],
      preconditions: [{
        key: 'some_flag',
        setup_text_modifier: 'Modified text',
      }],
    };

    const resolved = resolveScenarioPreconditions(scenario, {});
    expect(resolved.setup_text).toBe('Original text');
  });

  it('applies setup text modifier when precondition is triggered', () => {
    const scenario = {
      id: 'test',
      title: 'Test',
      category: 'market' as const,
      division: 'SAM' as const,
      year_range: [1, 2] as [number, number],
      is_tentpole: false,
      illustration_key: 'test',
      setup_text: 'Original text',
      random_params: {},
      options: [],
      preconditions: [{
        key: 'leverage_active',
        setup_text_modifier: 'You leveraged the portfolio. Things are worse.',
      }],
    };

    const resolved = resolveScenarioPreconditions(scenario, { leverage_active: true });
    expect(resolved.setup_text).toBe('You leveraged the portfolio. Things are worse.');
  });
});
