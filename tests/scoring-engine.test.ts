import { describe, it, expect } from 'vitest';
import {
  createInitialScores,
  applyScoreImpact,
  resolveConditionalConsequences,
  checkTerminalConditions,
} from '../src/engine/scoring-engine.js';

describe('createInitialScores', () => {
  it('returns correct starting values', () => {
    const scores = createInitialScores();
    expect(scores.solvency_ratio).toBe(150);
    expect(scores.cumulative_pnl).toBe(0);
    expect(scores.regulatory_standing).toBe('green');
    expect(scores.regulatory_flags).toBe(0);
    expect(scores.reputation).toBe(75);
    expect(scores.board_confidence).toBe(70);
  });
});

describe('applyScoreImpact', () => {
  it('applies additive impacts correctly', () => {
    const scores = createInitialScores();
    const result = applyScoreImpact(
      scores,
      { solvency_ratio: -10, cumulative_pnl: 30, reputation: -5, board_confidence: 5 },
      'pragmatist',
      'balanced',
    );
    expect(result.solvency_ratio).toBe(140);
    expect(result.cumulative_pnl).toBe(30);
    expect(result.reputation).toBe(70);
    expect(result.board_confidence).toBe(75);
  });

  it('clamps reputation to 0-100', () => {
    const scores = createInitialScores();
    const result = applyScoreImpact(
      scores,
      { reputation: -100 },
      'pragmatist',
      'balanced',
    );
    expect(result.reputation).toBe(0);

    const result2 = applyScoreImpact(
      scores,
      { reputation: 50 },
      'pragmatist',
      'balanced',
    );
    expect(result2.reputation).toBe(100);
  });

  it('clamps board confidence to 0-100', () => {
    const scores = createInitialScores();
    const result = applyScoreImpact(
      scores,
      { board_confidence: -100 },
      'pragmatist',
      'balanced',
    );
    expect(result.board_confidence).toBe(0);
  });

  it('clamps solvency to 0 minimum', () => {
    const scores = createInitialScores();
    const result = applyScoreImpact(
      scores,
      { solvency_ratio: -200 },
      'pragmatist',
      'balanced',
    );
    expect(result.solvency_ratio).toBe(0);
  });

  it('updates regulatory standing from flags', () => {
    const scores = createInitialScores();

    // One flag = amber
    const r1 = applyScoreImpact(scores, { regulatory_standing: 1 }, 'pragmatist', 'balanced');
    expect(r1.regulatory_standing).toBe('amber');
    expect(r1.regulatory_flags).toBe(1);

    // Three flags = red
    const r2 = applyScoreImpact(r1, { regulatory_standing: 2 }, 'pragmatist', 'balanced');
    expect(r2.regulatory_standing).toBe('red');
    expect(r2.regulatory_flags).toBe(3);
  });

  it('penalises guardian for aggressive choices', () => {
    const scores = createInitialScores();
    const result = applyScoreImpact(scores, {}, 'guardian', 'aggressive');
    expect(result.board_confidence).toBe(68); // 70 - 2 penalty
  });

  it('penalises disruptor for conservative choices with -3', () => {
    const scores = createInitialScores();
    const result = applyScoreImpact(scores, {}, 'disruptor', 'conservative');
    expect(result.board_confidence).toBe(67); // 70 - 3 penalty
  });

  it('never penalises pragmatist', () => {
    const scores = createInitialScores();
    const result = applyScoreImpact(scores, {}, 'pragmatist', 'aggressive');
    expect(result.board_confidence).toBe(70); // no penalty
  });

  it('does not penalise on-brand choices', () => {
    const scores = createInitialScores();
    const result = applyScoreImpact(scores, {}, 'guardian', 'conservative');
    expect(result.board_confidence).toBe(70); // no penalty
  });
});

describe('resolveConditionalConsequences', () => {
  it('returns base impact when no conditionals', () => {
    const result = resolveConditionalConsequences(
      { solvency_ratio: -5 },
      undefined,
      {},
    );
    expect(result.solvency_ratio).toBe(-5);
  });

  it('merges matching conditional impacts', () => {
    const result = resolveConditionalConsequences(
      { solvency_ratio: -5 },
      [
        { condition: 'yield_grab_leverage === true', impact: { solvency_ratio: -20 } },
      ],
      { yield_grab_leverage: true },
    );
    expect(result.solvency_ratio).toBe(-25);
  });

  it('ignores non-matching conditionals', () => {
    const result = resolveConditionalConsequences(
      { solvency_ratio: -5 },
      [
        { condition: 'yield_grab_leverage === true', impact: { solvency_ratio: -20 } },
      ],
      { yield_grab_leverage: false },
    );
    expect(result.solvency_ratio).toBe(-5);
  });
});

describe('checkTerminalConditions', () => {
  it('detects insolvency', () => {
    const scores = { ...createInitialScores(), solvency_ratio: 95 };
    const result = checkTerminalConditions(scores);
    expect(result.is_terminal).toBe(true);
    expect(result.reason).toBe('insolvent');
  });

  it('detects fired (low board confidence)', () => {
    const scores = { ...createInitialScores(), board_confidence: 25 };
    const result = checkTerminalConditions(scores);
    expect(result.is_terminal).toBe(true);
    expect(result.reason).toBe('fired');
  });

  it('returns not terminal for healthy scores', () => {
    const scores = createInitialScores();
    const result = checkTerminalConditions(scores);
    expect(result.is_terminal).toBe(false);
  });

  it('insolvency takes priority over fired', () => {
    const scores = { ...createInitialScores(), solvency_ratio: 50, board_confidence: 10 };
    const result = checkTerminalConditions(scores);
    expect(result.reason).toBe('insolvent');
  });
});
