import type { Strategy } from '../types/session.js';
import type { StrategyAlignment } from '../types/scenario.js';

/** Which alignment tags are "on-brand" for each strategy */
export const STRATEGY_ON_BRAND: Record<Strategy, StrategyAlignment[]> = {
  guardian:   ['conservative', 'balanced'],
  pragmatist: ['conservative', 'balanced', 'growth', 'aggressive'], // never penalised
  builder:    ['balanced', 'growth'],
  disruptor:  ['growth', 'aggressive'],
};

/** Board confidence penalty for off-brand choices */
export const STRATEGY_OFF_BRAND_PENALTY: Record<Strategy, number> = {
  guardian:   -2,
  pragmatist: 0,  // never penalised
  builder:    -2,
  disruptor:  -3, // board hired you to be bold
};

export const STRATEGY_LABELS: Record<Strategy, string> = {
  guardian:   'The Guardian',
  pragmatist: 'The Pragmatist',
  builder:    'The Builder',
  disruptor:  'The Disruptor',
};

export const STRATEGY_DESCRIPTIONS: Record<Strategy, string> = {
  guardian:   'Conservative. Prioritise solvency and regulatory standing above growth.',
  pragmatist: 'Balanced. Case-by-case judgment, no strong prior commitment.',
  builder:    'Growth-oriented. Willing to accept higher risk for franchise expansion.',
  disruptor:  'Aggressive. The firm needs bold moves to survive in a competitive market.',
};
