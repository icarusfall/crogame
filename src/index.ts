import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createSession, getNextScenario, submitDecision, getReport } from './engine/game-loop.js';
import { initStore, getStore } from './store/index.js';
import type { Strategy } from './types/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;

// Create a new game session
app.post('/api/sessions', async (req, res, next) => {
  try {
    const { player_name, strategy } = req.body;

    if (!player_name || typeof player_name !== 'string') {
      res.status(400).json({ error: 'player_name is required' });
      return;
    }

    const validStrategies: Strategy[] = ['guardian', 'pragmatist', 'builder', 'disruptor'];
    if (!validStrategies.includes(strategy)) {
      res.status(400).json({ error: `strategy must be one of: ${validStrategies.join(', ')}` });
      return;
    }

    const session = await createSession(player_name, strategy);
    const firstScenario = await getNextScenario(session.id);

    res.json({
      session_id: session.id,
      strategy: session.strategy,
      scores: session.scores,
      scenario: firstScenario,
    });
  } catch (err) {
    next(err);
  }
});

// Submit a decision
app.post('/api/sessions/:id/decisions', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { option_id, sub_choice_id } = req.body;

    if (!option_id) {
      res.status(400).json({ error: 'option_id is required' });
      return;
    }

    const result = await submitDecision(id, option_id, sub_choice_id);

    // Get next scenario if game isn't over
    let nextScenario = null;
    if (!result.is_game_over) {
      nextScenario = await getNextScenario(id);
    }

    res.json({
      ...result,
      next_scenario: nextScenario,
    });
  } catch (err) {
    next(err);
  }
});

// Get end-of-game report
app.get('/api/sessions/:id/report', async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await getReport(id);

    if (!report) {
      res.status(400).json({ error: 'Game is still in progress' });
      return;
    }

    res.json(report);
  } catch (err) {
    next(err);
  }
});

// Leaderboard — top completed games
app.get('/api/leaderboard', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const rankings = await getStore().getLeaderboard(limit);
    res.json({ rankings });
  } catch (err) {
    next(err);
  }
});

// Leaderboard stats — aggregate statistics
app.get('/api/leaderboard/stats', async (req, res, next) => {
  try {
    const allSessions = await getStore().getAll();
    const completed = allSessions.filter(s => s.status !== 'in_progress');

    const statusCounts: Record<string, number> = {};
    const strategyCounts: Record<string, number> = {};
    const titleCounts: Record<string, number> = {};

    for (const s of completed) {
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
      strategyCounts[s.strategy] = (strategyCounts[s.strategy] || 0) + 1;
      if (s.tenure_title) {
        titleCounts[s.tenure_title] = (titleCounts[s.tenure_title] || 0) + 1;
      }
    }

    const avgScores = completed.length > 0 ? {
      solvency_ratio: completed.reduce((a, s) => a + s.scores.solvency_ratio, 0) / completed.length,
      cumulative_pnl: completed.reduce((a, s) => a + s.scores.cumulative_pnl, 0) / completed.length,
      reputation: completed.reduce((a, s) => a + s.scores.reputation, 0) / completed.length,
      board_confidence: completed.reduce((a, s) => a + s.scores.board_confidence, 0) / completed.length,
    } : null;

    res.json({
      total_sessions: allSessions.length,
      completed_sessions: completed.length,
      in_progress: allSessions.length - completed.length,
      status_distribution: statusCounts,
      strategy_distribution: strategyCounts,
      title_distribution: titleCounts,
      average_scores: avgScores,
    });
  } catch (err) {
    next(err);
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  await initStore();
  app.listen(PORT, () => {
    console.log(`Be the CRO server running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
