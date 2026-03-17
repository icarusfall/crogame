CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY,
  player_name VARCHAR(100) NOT NULL,
  strategy VARCHAR(20) NOT NULL,
  scenario_sequence JSONB NOT NULL,
  current_scenario_index INTEGER NOT NULL DEFAULT 0,
  scores JSONB NOT NULL,
  compounding_state JSONB NOT NULL DEFAULT '{}',
  decisions JSONB NOT NULL DEFAULT '[]',
  narrative_parts JSONB NOT NULL DEFAULT '[]',
  tenure_title VARCHAR(100),
  luck_factor REAL,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_status ON game_sessions (status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON game_sessions (created_at);
