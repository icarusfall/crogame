import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { GameSession } from '../types/session.js';
import type { GameStore, LeaderboardEntry } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function reconstituteDates(session: any): GameSession {
  // PostgreSQL TIMESTAMPTZ columns come back as Date objects already.
  // But Decision.timestamp inside JSONB is stored as an ISO string.
  if (session.decisions && Array.isArray(session.decisions)) {
    for (const d of session.decisions) {
      if (typeof d.timestamp === 'string') {
        d.timestamp = new Date(d.timestamp);
      }
    }
  }
  return session as GameSession;
}

export class PostgresStore implements GameStore {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      max: 10,
      ssl: connectionString.includes('railway.app') || connectionString.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  async initialize(): Promise<void> {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await this.pool.query(schema);
    console.log('Database schema initialized');
  }

  async createSession(session: GameSession): Promise<void> {
    await this.pool.query(
      `INSERT INTO game_sessions (
        id, player_name, strategy, scenario_sequence, current_scenario_index,
        scores, compounding_state, decisions, narrative_parts,
        tenure_title, luck_factor, status, created_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        session.id,
        session.player_name,
        session.strategy,
        JSON.stringify(session.scenario_sequence),
        session.current_scenario_index,
        JSON.stringify(session.scores),
        JSON.stringify(session.compounding_state),
        JSON.stringify(session.decisions),
        JSON.stringify(session.narrative_parts),
        session.tenure_title || null,
        session.luck_factor ?? null,
        session.status,
        session.created_at,
        session.completed_at || null,
      ],
    );
  }

  async getSession(id: string): Promise<GameSession | undefined> {
    const result = await this.pool.query(
      `SELECT * FROM game_sessions WHERE id = $1`,
      [id],
    );
    if (result.rows.length === 0) return undefined;
    return this.rowToSession(result.rows[0]);
  }

  async updateSession(session: GameSession): Promise<void> {
    await this.pool.query(
      `UPDATE game_sessions SET
        scenario_sequence = $2,
        current_scenario_index = $3,
        scores = $4,
        compounding_state = $5,
        decisions = $6,
        narrative_parts = $7,
        tenure_title = $8,
        luck_factor = $9,
        status = $10,
        completed_at = $11
      WHERE id = $1`,
      [
        session.id,
        JSON.stringify(session.scenario_sequence),
        session.current_scenario_index,
        JSON.stringify(session.scores),
        JSON.stringify(session.compounding_state),
        JSON.stringify(session.decisions),
        JSON.stringify(session.narrative_parts),
        session.tenure_title || null,
        session.luck_factor ?? null,
        session.status,
        session.completed_at || null,
      ],
    );
  }

  async getAllCompleted(): Promise<GameSession[]> {
    const result = await this.pool.query(
      `SELECT * FROM game_sessions WHERE status != 'in_progress' ORDER BY completed_at DESC`,
    );
    return result.rows.map(row => this.rowToSession(row));
  }

  async getAll(): Promise<GameSession[]> {
    const result = await this.pool.query(
      `SELECT * FROM game_sessions ORDER BY created_at DESC`,
    );
    return result.rows.map(row => this.rowToSession(row));
  }

  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const result = await this.pool.query(
      `SELECT
        player_name, strategy, tenure_title, scores, luck_factor, status, completed_at,
        (
          (scores->>'solvency_ratio')::float * 0.3 +
          (scores->>'cumulative_pnl')::float * 0.25 +
          (scores->>'reputation')::float * 0.2 +
          (scores->>'board_confidence')::float * 0.2 -
          (scores->>'regulatory_flags')::float * 10 +
          COALESCE(luck_factor, 0) * 5
        ) AS composite_score
      FROM game_sessions
      WHERE status != 'in_progress'
      ORDER BY composite_score DESC
      LIMIT $1`,
      [limit],
    );

    return result.rows.map(row => ({
      player_name: row.player_name,
      strategy: row.strategy,
      tenure_title: row.tenure_title || 'The Survivor',
      scores: row.scores,
      luck_factor: row.luck_factor || 0,
      status: row.status,
      composite_score: parseFloat(row.composite_score),
      completed_at: row.completed_at || row.created_at,
    }));
  }

  async deleteAll(): Promise<number> {
    const result = await this.pool.query('DELETE FROM game_sessions');
    return result.rowCount ?? 0;
  }

  private rowToSession(row: any): GameSession {
    const session = {
      id: row.id,
      player_name: row.player_name,
      strategy: row.strategy,
      scenario_sequence: row.scenario_sequence,
      current_scenario_index: row.current_scenario_index,
      scores: row.scores,
      compounding_state: row.compounding_state,
      decisions: row.decisions,
      narrative_parts: row.narrative_parts,
      tenure_title: row.tenure_title,
      luck_factor: row.luck_factor,
      status: row.status,
      created_at: row.created_at,
      completed_at: row.completed_at,
    };
    return reconstituteDates(session);
  }
}
