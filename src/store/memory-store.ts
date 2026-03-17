import type { GameSession } from '../types/session.js';

export class MemoryStore {
  private sessions: Map<string, GameSession> = new Map();

  createSession(session: GameSession): void {
    this.sessions.set(session.id, session);
  }

  getSession(id: string): GameSession | undefined {
    return this.sessions.get(id);
  }

  updateSession(session: GameSession): void {
    this.sessions.set(session.id, session);
  }

  getAllCompleted(): GameSession[] {
    return Array.from(this.sessions.values()).filter(
      s => s.status !== 'in_progress',
    );
  }

  getAll(): GameSession[] {
    return Array.from(this.sessions.values());
  }
}

export const store = new MemoryStore();
