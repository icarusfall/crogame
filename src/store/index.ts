import type { GameStore } from './store.js';
import { MemoryStore } from './memory-store.js';

let _store: GameStore | null = null;

export async function initStore(): Promise<void> {
  if (_store) return;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const { PostgresStore } = await import('./postgres-store.js');
    const pgStore = new PostgresStore(databaseUrl);
    await pgStore.initialize();
    _store = pgStore;
    console.log('Using PostgreSQL store');
  } else {
    _store = new MemoryStore();
    console.log('Using in-memory store (no DATABASE_URL set)');
  }
}

export function getStore(): GameStore {
  if (!_store) {
    // Fallback for tests and scripts that don't call initStore
    _store = new MemoryStore();
  }
  return _store;
}

export type { GameStore } from './store.js';
export type { LeaderboardEntry } from './store.js';
