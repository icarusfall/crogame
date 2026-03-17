import type { ScoreDimensions, RegulatoryLevel } from '../types/scoring.js';
import type { ScoreImpact, Option, SubChoice, ConditionalConsequence } from '../types/scenario.js';
import type { Strategy } from '../types/session.js';
import type { StrategyAlignment } from '../types/scenario.js';
import { STRATEGY_ON_BRAND, STRATEGY_OFF_BRAND_PENALTY } from '../data/strategy-definitions.js';
import { evaluateCondition } from './compounding-engine.js';

export function createInitialScores(): ScoreDimensions {
  return {
    solvency_ratio: 150,
    cumulative_pnl: 0,
    regulatory_standing: 'green',
    regulatory_flags: 0,
    reputation: 75,
    board_confidence: 70,
  };
}

function regulatoryLevelFromFlags(flags: number): RegulatoryLevel {
  if (flags >= 3) return 'red';
  if (flags >= 1) return 'amber';
  return 'green';
}

export function resolveConditionalConsequences(
  baseImpact: ScoreImpact,
  conditionalConsequences: ConditionalConsequence[] | undefined,
  compoundingState: Record<string, string | number | boolean>,
): ScoreImpact {
  const merged: ScoreImpact = { ...baseImpact };

  if (!conditionalConsequences) return merged;

  for (const cc of conditionalConsequences) {
    if (evaluateCondition(cc.condition, compoundingState)) {
      if (cc.impact.solvency_ratio) merged.solvency_ratio = (merged.solvency_ratio ?? 0) + cc.impact.solvency_ratio;
      if (cc.impact.cumulative_pnl) merged.cumulative_pnl = (merged.cumulative_pnl ?? 0) + cc.impact.cumulative_pnl;
      if (cc.impact.regulatory_standing) merged.regulatory_standing = (merged.regulatory_standing ?? 0) + cc.impact.regulatory_standing;
      if (cc.impact.reputation) merged.reputation = (merged.reputation ?? 0) + cc.impact.reputation;
      if (cc.impact.board_confidence) merged.board_confidence = (merged.board_confidence ?? 0) + cc.impact.board_confidence;
    }
  }

  return merged;
}

export function applyScoreImpact(
  current: ScoreDimensions,
  impact: ScoreImpact,
  strategy: Strategy,
  optionAlignment: StrategyAlignment,
): ScoreDimensions {
  const updated = { ...current };

  // Apply additive impacts
  if (impact.solvency_ratio) updated.solvency_ratio += impact.solvency_ratio;
  if (impact.cumulative_pnl) updated.cumulative_pnl += impact.cumulative_pnl;
  if (impact.regulatory_standing) {
    updated.regulatory_flags = Math.max(0, updated.regulatory_flags + impact.regulatory_standing);
    updated.regulatory_standing = regulatoryLevelFromFlags(updated.regulatory_flags);
  }
  if (impact.reputation) updated.reputation += impact.reputation;
  if (impact.board_confidence) updated.board_confidence += impact.board_confidence;

  // Strategy consistency modifier
  const onBrand = STRATEGY_ON_BRAND[strategy];
  if (!onBrand.includes(optionAlignment)) {
    const penalty = STRATEGY_OFF_BRAND_PENALTY[strategy];
    updated.board_confidence += penalty;
  }

  // Clamp values
  updated.solvency_ratio = Math.max(0, updated.solvency_ratio);
  updated.reputation = Math.max(0, Math.min(100, updated.reputation));
  updated.board_confidence = Math.max(0, Math.min(100, updated.board_confidence));

  return updated;
}

export interface TerminalCheck {
  is_terminal: boolean;
  reason?: 'fired' | 'insolvent';
}

export function checkTerminalConditions(scores: ScoreDimensions): TerminalCheck {
  if (scores.solvency_ratio < 100) {
    return { is_terminal: true, reason: 'insolvent' };
  }
  if (scores.board_confidence < 45) {
    return { is_terminal: true, reason: 'fired' };
  }
  return { is_terminal: false };
}

export function calculateLuckFactor(
  rolledParams: Array<Record<string, number | boolean | string>>,
  paramDefs: Array<Record<string, { type: string; min?: number; max?: number; probability?: number }>>,
): number {
  let totalDeviation = 0;
  let paramCount = 0;

  for (let i = 0; i < rolledParams.length; i++) {
    const rolled = rolledParams[i];
    const defs = paramDefs[i];
    if (!rolled || !defs) continue;

    for (const [key, def] of Object.entries(defs)) {
      const value = rolled[key];
      if (value === undefined) continue;

      if (def.type === 'uniform' && typeof value === 'number' && def.min !== undefined && def.max !== undefined) {
        // How favourable was this roll? For most params, lower = luckier (less damage)
        // Normalise to 0-1 where 0 = worst luck, 1 = best luck
        const range = def.max - def.min;
        if (range > 0) {
          // Lower values generally mean less severity = luckier
          const normalised = 1 - (value - def.min) / range;
          totalDeviation += normalised - 0.5; // deviation from average
          paramCount++;
        }
      } else if (def.type === 'bernoulli' && typeof value === 'boolean' && def.probability !== undefined) {
        // For BoE intervention: true = lucky. For manual override failure: depends on context.
        // Simplify: bernoulli params where probability < 0.5 and result is true = lucky
        if (def.probability < 0.5 && value) {
          totalDeviation += 0.5;
          paramCount++;
        } else if (def.probability < 0.5 && !value) {
          totalDeviation -= 0.1; // expected outcome, slight unluck
          paramCount++;
        } else if (def.probability >= 0.5 && value) {
          totalDeviation += 0.1;
          paramCount++;
        } else {
          totalDeviation -= 0.5;
          paramCount++;
        }
      }
    }
  }

  if (paramCount === 0) return 0;
  // Normalise to roughly -1 to +1
  return Math.max(-1, Math.min(1, totalDeviation / paramCount * 2));
}
