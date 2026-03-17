import { v4 as uuidv4 } from 'uuid';
import type { Scenario, Option, SubChoice, PresentedScenario, ScoreImpact } from '../types/scenario.js';
import type { GameSession, Strategy, DecisionResult, GameReport, Decision } from '../types/session.js';
import type { ScoreDimensions } from '../types/scoring.js';
import { createInitialScores, applyScoreImpact, resolveConditionalConsequences, checkTerminalConditions, calculateLuckFactor } from './scoring-engine.js';
import { applyCompoundingEffects, resolveScenarioPreconditions, substituteTemplateVars, evaluateCondition } from './compounding-engine.js';
import { selectScenarios } from './scenario-selector.js';
import { assembleNarrativeSnippet, assembleFullNarrative } from './narrative-assembler.js';
import { determineTenureTitle } from '../data/tenure-titles.js';
import { getScenarioById, ALL_SCENARIOS } from '../data/scenarios/index.js';
import { store } from '../store/memory-store.js';
import type { RNG } from './random-params.js';
import { defaultRNG } from './random-params.js';

export function createSession(
  playerName: string,
  strategy: Strategy,
  rng: RNG = defaultRNG,
): GameSession {
  const scenarioSequence = selectScenarios(rng);

  const session: GameSession = {
    id: uuidv4(),
    player_name: playerName,
    strategy,
    scenario_sequence: scenarioSequence,
    current_scenario_index: 0,
    scores: createInitialScores(),
    compounding_state: {},
    decisions: [],
    narrative_parts: [],
    status: 'in_progress',
    created_at: new Date(),
  };

  store.createSession(session);
  return session;
}

export function getNextScenario(sessionId: string): PresentedScenario | null {
  const session = store.getSession(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);
  if (session.status !== 'in_progress') return null;
  if (session.current_scenario_index >= session.scenario_sequence.length) return null;

  const scheduled = session.scenario_sequence[session.current_scenario_index];

  // Skip conditional scenarios whose conditions aren't met
  if (scheduled.is_conditional) {
    const scenario = getScenarioById(scheduled.scenario_id);
    if (scenario?.follow_up_condition) {
      // For multi-round follow-ups, check if the parent scenario was actually played
      // The follow_up_condition is the compounding key that must be truthy
      // But actually, for four_percent follow-ups, we use the parent's compounding key
    }
    // For the Four Percent Problem, follow-ups always fire if round 1 was played
    const parentKey = scenario?.preconditions?.[0]?.key;
    // Simple check: if the scenario has a follow_up_condition field on its parent,
    // look for any evidence the parent was played
    if (scenario?.round && scenario.round > 1) {
      // Check if previous round was played by looking at decisions
      const prevRoundPlayed = session.decisions.some(d => {
        const prevId = scheduled.scenario_id.replace(/r\d$/, `r${scenario.round! - 1}`);
        return d.scenario_id === prevId || d.scenario_id.startsWith('four_pct_r' + (scenario.round! - 1));
      });
      if (!prevRoundPlayed) {
        // Skip this conditional scenario
        session.current_scenario_index++;
        store.updateSession(session);
        return getNextScenario(sessionId);
      }
    }
  }

  let scenario = getScenarioById(scheduled.scenario_id);
  if (!scenario) throw new Error(`Scenario not found: ${scheduled.scenario_id}`);

  // Apply preconditions from compounding state
  scenario = resolveScenarioPreconditions(scenario, session.compounding_state);

  // Substitute random params into setup text
  const setupText = substituteTemplateVars(scenario.setup_text, scheduled.rolled_params);

  // Build presented scenario (strip consequence details)
  const presented: PresentedScenario = {
    id: scenario.id,
    title: scenario.title,
    category: scenario.category,
    division: scenario.division,
    year: scheduled.year,
    illustration_key: scenario.illustration_key,
    setup_text: setupText,
    options: scenario.options.map(opt => ({
      id: opt.id,
      label: opt.label,
      description: opt.description,
      sub_choices: opt.sub_choices?.map(sc => ({
        id: sc.id,
        label: sc.label,
        description: sc.description,
      })),
    })),
  };

  return presented;
}

export function submitDecision(
  sessionId: string,
  optionId: string,
  subChoiceId?: string,
  rng: RNG = defaultRNG,
): DecisionResult {
  const session = store.getSession(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);
  if (session.status !== 'in_progress') throw new Error('Game is not in progress');

  const scheduled = session.scenario_sequence[session.current_scenario_index];
  let scenario = getScenarioById(scheduled.scenario_id);
  if (!scenario) throw new Error(`Scenario not found: ${scheduled.scenario_id}`);

  // Apply preconditions
  scenario = resolveScenarioPreconditions(scenario, session.compounding_state);

  // Find chosen option
  const option = scenario.options.find(o => o.id === optionId);
  if (!option) throw new Error(`Option not found: ${optionId}`);

  // Find sub-choice if applicable
  let chosenSubChoice: SubChoice | undefined;
  if (subChoiceId && option.sub_choices) {
    chosenSubChoice = option.sub_choices.find(sc => sc.id === subChoiceId);
    if (!chosenSubChoice) throw new Error(`Sub-choice not found: ${subChoiceId}`);
  }

  // Determine the effective choice (sub-choice overrides option)
  const effectiveChoice = chosenSubChoice || option;

  // Merge rolled params into a state-like object for conditional evaluation
  const evalState: Record<string, string | number | boolean> = {
    ...session.compounding_state,
  };
  for (const [k, v] of Object.entries(scheduled.rolled_params)) {
    evalState[k] = v;
  }

  // Resolve conditional consequences
  const resolvedImpact = resolveConditionalConsequences(
    effectiveChoice.consequences,
    effectiveChoice.conditional_consequences,
    evalState,
  );

  // Apply score impact with strategy consistency
  const updatedScores = applyScoreImpact(
    session.scores,
    resolvedImpact,
    session.strategy,
    effectiveChoice.strategy_alignment,
  );

  // Apply compounding effects
  let updatedCompounding = applyCompoundingEffects(
    session.compounding_state,
    effectiveChoice.compounding_effects,
  );

  // If this was the base option with sub-choices and a sub-choice was picked,
  // don't also apply the base option's compounding effects
  if (!chosenSubChoice) {
    // Already applied effectiveChoice (which IS the option)
  }

  // Assemble narrative
  const narrativeSnippet = assembleNarrativeSnippet(
    effectiveChoice,
    scheduled.rolled_params,
    updatedCompounding,
    scenario,
    scheduled.year,
  );

  // Record decision
  const decision: Decision = {
    scenario_id: scenario.id,
    round: scenario.round || 1,
    option_chosen: optionId,
    sub_choice: subChoiceId,
    random_outcome: scheduled.rolled_params,
    score_impacts: resolvedImpact,
    narrative_snippet: narrativeSnippet,
    timestamp: new Date(),
  };

  // Update session
  session.scores = updatedScores;
  session.compounding_state = updatedCompounding;
  session.decisions.push(decision);
  session.narrative_parts.push(narrativeSnippet);
  session.current_scenario_index++;

  // Apply interstitial "quiet quarter" bonus when moving to a new year
  // Represents normal business operations between crisis decisions
  const currentYear = scheduled.year;
  const nextScheduled = session.scenario_sequence[session.current_scenario_index];
  if (nextScheduled && nextScheduled.year > currentYear) {
    const yearGap = nextScheduled.year - currentYear;
    const interstitialResult = applyInterstitialBonus(updatedScores, yearGap, rng);
    session.scores = interstitialResult.scores;
    Object.assign(updatedScores, interstitialResult.scores);
    if (interstitialResult.narrative) {
      session.narrative_parts.push(interstitialResult.narrative);
    }
  }

  // Check terminal conditions
  const terminal = checkTerminalConditions(updatedScores);
  let isGameOver = false;
  let gameOverReason: 'completed' | 'fired' | 'insolvent' | undefined;

  if (terminal.is_terminal) {
    isGameOver = true;
    gameOverReason = terminal.reason;
    session.status = terminal.reason === 'fired' ? 'fired' : 'insolvent';
    session.completed_at = new Date();
    finalizeSession(session);
  } else if (session.current_scenario_index >= session.scenario_sequence.length) {
    // Apply final year bonus for remaining years of the five-year tenure
    const remainingYears = Math.max(0, 5 - currentYear);
    if (remainingYears > 0) {
      const finalResult = applyInterstitialBonus(updatedScores, remainingYears, rng);
      session.scores = finalResult.scores;
      Object.assign(updatedScores, finalResult.scores);
      if (finalResult.narrative) {
        session.narrative_parts.push(finalResult.narrative);
      }
    }

    isGameOver = true;
    gameOverReason = 'completed';
    session.status = 'completed';
    session.completed_at = new Date();
    finalizeSession(session);
  }

  store.updateSession(session);

  return {
    score_impacts: resolvedImpact,
    narrative_snippet: narrativeSnippet,
    random_outcome: Object.keys(scheduled.rolled_params).length > 0 ? scheduled.rolled_params : undefined,
    is_game_over: isGameOver,
    game_over_reason: gameOverReason,
    scores: updatedScores,
  };
}

const INTERSTITIAL_NARRATIVES = [
  "The markets were kind. Premiums came in, claims went out, and the actuaries' assumptions held. " +
    "For a quarter, the job was almost pleasant.",
  "A quiet period. New business targets were met. The operations team processed renewals " +
    "without incident. Nobody called from the PRA.",
  "Normal service resumed. The investment portfolio generated steady returns. " +
    "The CFO presented numbers that required no explanation and no apology.",
  "The business hummed along. Claims experience was benign. Lapse rates were as modelled. " +
    "The Head of Internal Ratings had no new concerns to raise, which concerned you slightly.",
  "An unremarkable quarter. Premium income grew modestly. Investment returns were in line. " +
    "Your Head of Risk Operations said 'nothing to report,' which is the best thing she can say.",
];

function applyInterstitialBonus(
  scores: ScoreDimensions,
  yearGap: number,
  rng: RNG,
): { scores: ScoreDimensions; narrative: string | null } {
  if (yearGap <= 0) return { scores, narrative: null };

  const updated = { ...scores };

  // Each year of normal operations generates some profit and minor solvency improvement
  // Base: £4m P&L per year, ±£2m variance, +0-2 solvency per year
  for (let i = 0; i < yearGap; i++) {
    const pnlBonus = 4 + Math.floor(rng() * 5) - 2; // 2 to 7
    const solvencyBonus = Math.floor(rng() * 3); // 0 to 2
    updated.cumulative_pnl += pnlBonus;
    updated.solvency_ratio += solvencyBonus;
  }

  // Clamp
  updated.solvency_ratio = Math.max(0, updated.solvency_ratio);

  // Pick a narrative snippet
  const narrativeIdx = Math.floor(rng() * INTERSTITIAL_NARRATIVES.length);
  const narrative = yearGap > 1
    ? `Between the crises, ${yearGap} quieter years passed.\n\n${INTERSTITIAL_NARRATIVES[narrativeIdx]}`
    : INTERSTITIAL_NARRATIVES[narrativeIdx];

  return { scores: updated, narrative };
}

function finalizeSession(session: GameSession): void {
  // Calculate luck factor
  const rolledParamsArray = session.scenario_sequence.map(s => s.rolled_params);
  const paramDefsArray = session.scenario_sequence.map(s => {
    const scenario = getScenarioById(s.scenario_id);
    return scenario?.random_params || {};
  });

  session.luck_factor = calculateLuckFactor(
    rolledParamsArray,
    paramDefsArray as any,
  );

  // Determine tenure title
  session.tenure_title = determineTenureTitle(
    session.scores,
    session.status,
    session.luck_factor,
    session.decisions.length,
  );
}

export function getReport(sessionId: string): GameReport | null {
  const session = store.getSession(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);
  if (session.status === 'in_progress') return null;

  const narrative = assembleFullNarrative(session);

  return {
    player_name: session.player_name,
    strategy: session.strategy,
    tenure_title: session.tenure_title || 'The Survivor',
    scores: session.scores,
    luck_factor: session.luck_factor || 0,
    narrative,
    decisions: session.decisions,
    status: session.status,
  };
}
