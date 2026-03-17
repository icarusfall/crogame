import type { ScoreDimensions } from '../types/scoring.js';
import type { SessionStatus } from '../types/session.js';

export interface TenureTitleRule {
  title: string;
  description: string;
  check: (scores: ScoreDimensions, status: SessionStatus, luckFactor: number, decisionCount: number) => boolean;
}

/**
 * Tenure title rules, checked in priority order (first match wins).
 */
export const TENURE_TITLE_RULES: TenureTitleRule[] = [
  {
    title: "The PRA's Favourite",
    description: 'Wound down under regulatory direction',
    check: (scores, status) =>
      status === 'insolvent' && scores.regulatory_standing === 'red',
  },
  {
    title: 'Gone by Christmas',
    description: 'Board lost confidence early, fired before year 5',
    check: (scores, status, _, decisionCount) =>
      status === 'fired' && decisionCount < 8,
  },
  {
    title: "The People's Champion",
    description: 'Great customer outcomes, board fired you for being too cautious',
    check: (scores, status) =>
      status === 'fired' && scores.reputation >= 70,
  },
  {
    title: 'The Sphinx',
    description: "Copied Sphinx's strategy and it worked (this time)",
    check: (scores, status) =>
      status === 'completed' &&
      scores.cumulative_pnl > 40 &&
      scores.solvency_ratio < 130,
  },
  {
    title: 'Against All Odds',
    description: 'Good outcomes despite tough random rolls',
    check: (scores, status, luckFactor) =>
      status === 'completed' &&
      luckFactor < -0.3 &&
      scores.solvency_ratio >= 115 &&
      scores.cumulative_pnl > 0,
  },
  {
    title: 'The Lucky One',
    description: 'Good outcomes driven primarily by favourable random rolls',
    check: (scores, status, luckFactor) =>
      status === 'completed' &&
      luckFactor > 0.4 &&
      scores.solvency_ratio >= 115 &&
      scores.cumulative_pnl > 10,
  },
  {
    title: 'The Gambler',
    description: 'High profits but significant regulatory trouble',
    check: (scores, status) =>
      (status === 'completed' || status === 'fired') &&
      scores.cumulative_pnl > 20 &&
      scores.regulatory_standing === 'red',
  },
  {
    title: 'The Operator',
    description: 'Board loved you, regulators did not',
    check: (scores, status) =>
      status === 'completed' &&
      scores.board_confidence >= 70 &&
      scores.regulatory_standing !== 'green',
  },
  {
    title: 'The Steady Hand',
    description: 'Survived, modest profits, clean regulatory record',
    check: (scores, status) =>
      status === 'completed' &&
      scores.solvency_ratio >= 125 &&
      scores.cumulative_pnl >= 0 &&
      scores.regulatory_standing !== 'red',
  },
  {
    title: 'Steadfast: Still Here, Barely',
    description: 'Ultra-cautious, survived but firm is dying of irrelevance',
    check: (scores, status) =>
      status === 'completed' &&
      scores.cumulative_pnl < 0 &&
      scores.regulatory_standing === 'green' &&
      scores.board_confidence < 50,
  },
  {
    title: 'The Phoenix',
    description: 'Survived with the scars to prove it',
    check: (scores, status) =>
      status === 'completed' &&
      scores.solvency_ratio >= 110 &&
      scores.solvency_ratio < 135 &&
      scores.cumulative_pnl >= -20,
  },
  {
    title: 'The High Wire',
    description: 'Made it through with everything intact — just',
    check: (scores, status) =>
      status === 'completed' &&
      scores.solvency_ratio >= 100 &&
      scores.solvency_ratio < 115,
  },
  // Fallback titles for terminal states
  {
    title: 'Insolvent',
    description: 'The firm collapsed on your watch',
    check: (_, status) => status === 'insolvent',
  },
  {
    title: 'Dismissed',
    description: 'The board lost confidence',
    check: (_, status) => status === 'fired',
  },
  // Ultimate fallback
  {
    title: 'The Survivor',
    description: 'Made it through five years. Somehow.',
    check: () => true,
  },
];

export function determineTenureTitle(
  scores: ScoreDimensions,
  status: SessionStatus,
  luckFactor: number,
  decisionCount: number,
): string {
  for (const rule of TENURE_TITLE_RULES) {
    if (rule.check(scores, status, luckFactor, decisionCount)) {
      return rule.title;
    }
  }
  return 'The Survivor'; // should never reach here due to fallback
}
