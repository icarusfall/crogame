import express from 'express';
import { createSession, getNextScenario, submitDecision, getReport } from './engine/game-loop.js';
import type { Strategy } from './types/session.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Create a new game session
app.post('/api/sessions', (req, res) => {
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

    const session = createSession(player_name, strategy);
    const firstScenario = getNextScenario(session.id);

    res.json({
      session_id: session.id,
      strategy: session.strategy,
      scores: session.scores,
      scenario: firstScenario,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a decision
app.post('/api/sessions/:id/decisions', (req, res) => {
  try {
    const { id } = req.params;
    const { option_id, sub_choice_id } = req.body;

    if (!option_id) {
      res.status(400).json({ error: 'option_id is required' });
      return;
    }

    const result = submitDecision(id, option_id, sub_choice_id);

    // Get next scenario if game isn't over
    let nextScenario = null;
    if (!result.is_game_over) {
      nextScenario = getNextScenario(id);
    }

    res.json({
      ...result,
      next_scenario: nextScenario,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get end-of-game report
app.get('/api/sessions/:id/report', (req, res) => {
  try {
    const { id } = req.params;
    const report = getReport(id);

    if (!report) {
      res.status(400).json({ error: 'Game is still in progress' });
      return;
    }

    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Be the CRO server running on port ${PORT}`);
});

export default app;
