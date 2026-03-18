import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createSession, getNextScenario, submitDecision, getReport } from './engine/game-loop.js';
import { initStore, getStore } from './store/index.js';
import { ALL_SCENARIOS } from './data/scenarios/index.js';
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

// Aggregate stats for the presentation page
app.get('/api/stats', async (req, res, next) => {
  try {
    const allSessions = await getStore().getAll();
    const completed = allSessions.filter(s => s.status !== 'in_progress');

    // Outcome distribution
    const outcome_distribution: Record<string, number> = { completed: 0, fired: 0, insolvent: 0 };
    for (const s of completed) {
      outcome_distribution[s.status] = (outcome_distribution[s.status] || 0) + 1;
    }

    // Strategy distribution (all sessions, not just completed)
    const strategy_distribution: Record<string, number> = { guardian: 0, pragmatist: 0, builder: 0, disruptor: 0 };
    for (const s of allSessions) {
      strategy_distribution[s.strategy] = (strategy_distribution[s.strategy] || 0) + 1;
    }

    // Average scores by strategy (completed only)
    const strategyGroups: Record<string, typeof completed> = {};
    for (const s of completed) {
      if (!strategyGroups[s.strategy]) strategyGroups[s.strategy] = [];
      strategyGroups[s.strategy].push(s);
    }

    const average_scores_by_strategy: Record<string, any> = {};
    for (const [strategy, sessions] of Object.entries(strategyGroups)) {
      const n = sessions.length;
      average_scores_by_strategy[strategy] = {
        solvency_ratio: Math.round(sessions.reduce((a, s) => a + s.scores.solvency_ratio, 0) / n),
        cumulative_pnl: Math.round(sessions.reduce((a, s) => a + s.scores.cumulative_pnl, 0) / n),
        reputation: Math.round(sessions.reduce((a, s) => a + s.scores.reputation, 0) / n),
        board_confidence: Math.round(sessions.reduce((a, s) => a + s.scores.board_confidence, 0) / n),
        count: n,
      };
    }

    // Choice distributions per scenario
    const choiceCounts: Record<string, Record<string, number>> = {};
    for (const s of allSessions) {
      for (const d of s.decisions) {
        if (!choiceCounts[d.scenario_id]) choiceCounts[d.scenario_id] = {};
        choiceCounts[d.scenario_id][d.option_chosen] = (choiceCounts[d.scenario_id][d.option_chosen] || 0) + 1;
      }
    }

    const choice_distributions: Record<string, any> = {};
    for (const [scenarioId, optionCounts] of Object.entries(choiceCounts)) {
      const scenario = ALL_SCENARIOS[scenarioId];
      const total = Object.values(optionCounts).reduce((a, b) => a + b, 0);
      const options: Record<string, any> = {};

      for (const [optionId, count] of Object.entries(optionCounts)) {
        const opt = scenario?.options.find(o => o.id === optionId);
        options[optionId] = {
          label: opt?.label || optionId,
          count,
          percentage: Math.round((count / total) * 100),
        };
      }

      choice_distributions[scenarioId] = {
        title: scenario?.title || scenarioId,
        options,
        total,
      };
    }

    // Tenure title distribution
    const title_distribution: Record<string, number> = {};
    for (const s of completed) {
      const title = s.tenure_title || 'Unknown';
      title_distribution[title] = (title_distribution[title] || 0) + 1;
    }

    res.json({
      total_sessions: allSessions.length,
      completed_sessions: completed.length,
      in_progress: allSessions.length - completed.length,
      outcome_distribution,
      strategy_distribution,
      average_scores_by_strategy,
      choice_distributions,
      title_distribution,
    });
  } catch (err) {
    next(err);
  }
});

// Admin: clear all data
app.delete('/api/admin/reset', async (req, res, next) => {
  try {
    const { confirm } = req.body;
    if (confirm !== 'RESET_ALL_DATA') {
      res.status(400).json({ error: 'Must include { "confirm": "RESET_ALL_DATA" } in request body' });
      return;
    }
    const deleted = await getStore().deleteAll();
    res.json({ message: 'All game data cleared', deleted_count: deleted });
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
