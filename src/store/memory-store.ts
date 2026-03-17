import type { GameSession } from '../types/session.js';
import type { GameStore, LeaderboardEntry } from './store.js';

function calculateCompositeScore(session: GameSession): number {
  const s = session.scores;
  return (
    s.solvency_ratio * 0.3 +
    s.cumulative_pnl * 0.25 +
    s.reputation * 0.2 +
    s.board_confidence * 0.2 -
    s.regulatory_flags * 10 +
    (session.luck_factor || 0) * 5
  );
}

export class MemoryStore implements GameStore {
  private sessions: Map<string, GameSession> = new Map();

  async createSession(session: GameSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async getSession(id: string): Promise<GameSession | undefined> {
    return this.sessions.get(id);
  }

  async updateSession(session: GameSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async getAllCompleted(): Promise<GameSession[]> {
    return Array.from(this.sessions.values()).filter(
      s => s.status !== 'in_progress',
    );
  }

  async getAll(): Promise<GameSession[]> {
    return Array.from(this.sessions.values());
  }

  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const completed = Array.from(this.sessions.values()).filter(
      s => s.status !== 'in_progress',
    );

    return completed
      .map(s => ({
        player_name: s.player_name,
        strategy: s.strategy,
        tenure_title: s.tenure_title || 'The Survivor',
        scores: s.scores,
        luck_factor: s.luck_factor || 0,
        status: s.status,
        composite_score: calculateCompositeScore(s),
        completed_at: s.completed_at || s.created_at,
      }))
      .sort((a, b) => b.composite_score - a.composite_score)
      .slice(0, limit);
  }
}
