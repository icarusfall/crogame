import type { GameSession, Strategy } from '../types/session.js';
import type { ScoreDimensions } from '../types/scoring.js';

export interface LeaderboardEntry {
  player_name: string;
  strategy: Strategy;
  tenure_title: string;
  scores: ScoreDimensions;
  luck_factor: number;
  status: string;
  composite_score: number;
  completed_at: Date;
}

export interface GameStore {
  createSession(session: GameSession): Promise<void>;
  getSession(id: string): Promise<GameSession | undefined>;
  updateSession(session: GameSession): Promise<void>;
  getAllCompleted(): Promise<GameSession[]>;
  getAll(): Promise<GameSession[]>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
}
