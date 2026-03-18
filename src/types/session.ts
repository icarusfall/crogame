import type { ScoreDimensions } from './scoring.js';
import type { ScoreImpact } from './scenario.js';

export type Strategy = 'guardian' | 'pragmatist' | 'builder' | 'disruptor';
export type SessionStatus = 'in_progress' | 'completed' | 'fired' | 'insolvent';

export interface ScheduledScenario {
  scenario_id: string;
  year: number;
  order_in_year: number;
  rolled_params: Record<string, number | boolean | string>;
  is_conditional?: boolean; // For multi-round follow-ups
}

export interface Decision {
  scenario_id: string;
  round: number;
  option_chosen: string;
  sub_choice?: string;
  random_outcome?: Record<string, number | boolean | string>;
  score_impacts: ScoreImpact;
  narrative_snippet: string;
  timestamp: Date;
}

export interface GameSession {
  id: string;
  player_name: string;
  strategy: Strategy;
  scenario_sequence: ScheduledScenario[];
  current_scenario_index: number;
  scores: ScoreDimensions;
  compounding_state: Record<string, string | number | boolean>;
  decisions: Decision[];
  narrative_parts: string[];
  tenure_title?: string;
  luck_factor?: number;
  status: SessionStatus;
  created_at: Date;
  completed_at?: Date;
}

export interface DecisionResult {
  score_impacts: ScoreImpact;
  narrative_snippet: string;
  interstitial_narrative?: string;
  random_outcome?: Record<string, number | boolean | string>;
  is_game_over: boolean;
  game_over_reason?: 'completed' | 'fired' | 'insolvent';
  scores: ScoreDimensions;
}

export interface GameReport {
  player_name: string;
  strategy: Strategy;
  tenure_title: string;
  scores: ScoreDimensions;
  luck_factor: number;
  narrative: string;
  decisions: Decision[];
  status: SessionStatus;
}
