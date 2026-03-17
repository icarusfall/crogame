import seedrandom from 'seedrandom';
import { createSession, getNextScenario, submitDecision, getReport } from '../src/engine/game-loop.js';
import type { Strategy } from '../src/types/session.js';

const NUM_SIMULATIONS = 1000;
const STRATEGIES: Strategy[] = ['guardian', 'pragmatist', 'builder', 'disruptor'];

interface SimResult {
  status: string;
  tenure_title: string;
  strategy: Strategy;
  solvency: number;
  pnl: number;
  regulatory: string;
  reputation: number;
  board_confidence: number;
  luck_factor: number;
  decisions: number;
}

function runSimulation(seed: string, strategy: Strategy): SimResult {
  const rng = seedrandom(seed);
  const session = createSession(`Sim-${seed}`, strategy, () => rng());

  let decisionCount = 0;
  let gameOver = false;

  while (!gameOver && decisionCount < 15) {
    const scenario = getNextScenario(session.id);
    if (!scenario) break;

    // Random option selection (weighted slightly toward middle options for realism)
    const weights = scenario.options.map((_, i) => {
      const mid = (scenario.options.length - 1) / 2;
      return 1 + 0.5 * (1 - Math.abs(i - mid) / mid);
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = rng() * totalWeight;
    let chosenIdx = 0;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        chosenIdx = i;
        break;
      }
    }

    const option = scenario.options[chosenIdx];
    let subChoiceId: string | undefined;
    if (option.sub_choices && option.sub_choices.length > 0) {
      subChoiceId = option.sub_choices[Math.floor(rng() * option.sub_choices.length)].id;
    }

    const result = submitDecision(session.id, option.id, subChoiceId, () => rng());
    decisionCount++;
    gameOver = result.is_game_over;
  }

  const report = getReport(session.id);

  return {
    status: report?.status || 'unknown',
    tenure_title: report?.tenure_title || 'Unknown',
    strategy,
    solvency: report?.scores.solvency_ratio || 0,
    pnl: report?.scores.cumulative_pnl || 0,
    regulatory: report?.scores.regulatory_standing || 'unknown',
    reputation: report?.scores.reputation || 0,
    board_confidence: report?.scores.board_confidence || 0,
    luck_factor: report?.luck_factor || 0,
    decisions: decisionCount,
  };
}

// Run simulations
console.log(`Running ${NUM_SIMULATIONS} simulations...\n`);

const results: SimResult[] = [];

for (let i = 0; i < NUM_SIMULATIONS; i++) {
  const strategy = STRATEGIES[i % STRATEGIES.length];
  const result = runSimulation(`sim-${i}`, strategy);
  results.push(result);
}

// Analyse results
const statusCounts: Record<string, number> = {};
const titleCounts: Record<string, number> = {};
const strategyStatusCounts: Record<string, Record<string, number>> = {};
const regulatoryCounts: Record<string, number> = {};

for (const r of results) {
  statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  titleCounts[r.tenure_title] = (titleCounts[r.tenure_title] || 0) + 1;
  regulatoryCounts[r.regulatory] = (regulatoryCounts[r.regulatory] || 0) + 1;

  if (!strategyStatusCounts[r.strategy]) strategyStatusCounts[r.strategy] = {};
  strategyStatusCounts[r.strategy][r.status] = (strategyStatusCounts[r.strategy][r.status] || 0) + 1;
}

console.log('=== OUTCOME DISTRIBUTION ===');
for (const [status, count] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${status}: ${count} (${((count / NUM_SIMULATIONS) * 100).toFixed(1)}%)`);
}

console.log('\n=== TARGET vs ACTUAL ===');
const insolventPct = ((statusCounts['insolvent'] || 0) / NUM_SIMULATIONS * 100).toFixed(1);
const firedPct = ((statusCounts['fired'] || 0) / NUM_SIMULATIONS * 100).toFixed(1);
const finedPct = (((regulatoryCounts['amber'] || 0) + (regulatoryCounts['red'] || 0)) / NUM_SIMULATIONS * 100).toFixed(1);
const cleanPct = ((statusCounts['completed'] || 0) / NUM_SIMULATIONS * 100).toFixed(1);
console.log(`  Insolvent: ${insolventPct}% (target: ~10%)`);
console.log(`  Fired: ${firedPct}% (target: ~15%)`);
console.log(`  Fined (amber+red): ${finedPct}% (target: ~50%+)`);
console.log(`  Completed clean: ${cleanPct}%`);

console.log('\n=== REGULATORY STANDING ===');
for (const [level, count] of Object.entries(regulatoryCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${level}: ${count} (${((count / NUM_SIMULATIONS) * 100).toFixed(1)}%)`);
}

console.log('\n=== BY STRATEGY ===');
for (const strategy of STRATEGIES) {
  const counts = strategyStatusCounts[strategy] || {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`  ${strategy}:`);
  for (const [status, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${status}: ${count} (${((count / total) * 100).toFixed(1)}%)`);
  }
}

console.log('\n=== TENURE TITLES ===');
for (const [title, count] of Object.entries(titleCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  "${title}": ${count} (${((count / NUM_SIMULATIONS) * 100).toFixed(1)}%)`);
}

// Score distributions
const completedResults = results.filter(r => r.status === 'completed');
if (completedResults.length > 0) {
  const avgSolvency = completedResults.reduce((a, b) => a + b.solvency, 0) / completedResults.length;
  const avgPnl = completedResults.reduce((a, b) => a + b.pnl, 0) / completedResults.length;
  const avgReputation = completedResults.reduce((a, b) => a + b.reputation, 0) / completedResults.length;
  const avgBoardConf = completedResults.reduce((a, b) => a + b.board_confidence, 0) / completedResults.length;

  const profitableCount = completedResults.filter(r => r.pnl > 0).length;
  const profitablePct = ((profitableCount / completedResults.length) * 100).toFixed(1);

  console.log('\n=== AVERAGE SCORES (completed games only) ===');
  console.log(`  Solvency: ${avgSolvency.toFixed(1)}%`);
  console.log(`  P&L: £${avgPnl.toFixed(1)}m`);
  console.log(`  Profitable: ${profitableCount}/${completedResults.length} (${profitablePct}%)`);
  console.log(`  Reputation: ${avgReputation.toFixed(1)}/100`);
  console.log(`  Board Confidence: ${avgBoardConf.toFixed(1)}/100`);
}

console.log(`\nTotal simulations: ${NUM_SIMULATIONS}`);
