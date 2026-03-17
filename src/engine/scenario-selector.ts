import type { Scenario, RandomParamDef } from '../types/scenario.js';
import type { ScheduledScenario } from '../types/session.js';
import { rollRandomParams, type RNG, defaultRNG } from './random-params.js';
import { getSelectableScenarios, getScenarioById } from '../data/scenarios/index.js';

interface YearSlot {
  year: number;
  scenario_id: string;
  is_conditional: boolean;
}

/**
 * Select and schedule 10 scenarios for a playthrough.
 * Ensures tentpoles are included, constraints are met, and random params are rolled.
 */
export function selectScenarios(rng: RNG = defaultRNG): ScheduledScenario[] {
  const allScenarios = getSelectableScenarios();
  const tentpoles = allScenarios.filter(s => s.is_tentpole);
  const pool = allScenarios.filter(s => !s.is_tentpole);

  // Step 1: Draw pool scenarios
  const poolPicks = drawPoolScenarios(tentpoles, pool, rng);

  // Step 2: Combine tentpoles + pool picks
  const selected = [...tentpoles, ...poolPicks];

  // Step 3: Assign to years
  const yearAssignment = assignToYears(selected, rng);

  // Step 4: Reserve slots for multi-round follow-ups
  const withFollowUps = reserveFollowUpSlots(yearAssignment);

  // Step 5: Randomise order within each year
  const ordered = randomiseWithinYears(withFollowUps, rng);

  // Step 6: Roll random params for each scenario
  return ordered.map((slot, idx) => {
    const scenario = getScenarioById(slot.scenario_id);
    const rolledParams = scenario
      ? rollRandomParams(scenario.random_params, rng)
      : {};

    return {
      scenario_id: slot.scenario_id,
      year: slot.year,
      order_in_year: idx % 2, // 0 or 1 within each year
      rolled_params: rolledParams,
      is_conditional: slot.is_conditional,
    };
  });
}

function drawPoolScenarios(
  tentpoles: Scenario[],
  pool: Scenario[],
  rng: RNG,
): Scenario[] {
  // Count categories and divisions already covered by tentpoles
  const categoryCounts: Record<string, number> = {};
  const divisionsCovered = new Set<string>();

  for (const t of tentpoles) {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    divisionsCovered.add(t.division);
  }

  // Determine which divisions still need coverage
  const requiredDivisions = new Set(['SAM', 'SIR', 'SW']);
  for (const d of divisionsCovered) requiredDivisions.delete(d);

  // Shuffle pool
  const shuffled = [...pool].sort(() => rng() - 0.5);

  const picks: Scenario[] = [];
  const needed = 5; // We need 5 pool scenarios + 5 tentpoles = 10

  // First pass: pick scenarios that fill required divisions
  for (const div of requiredDivisions) {
    const candidate = shuffled.find(
      s =>
        s.division === div &&
        !picks.includes(s) &&
        (categoryCounts[s.category] || 0) < 2,
    );
    if (candidate) {
      picks.push(candidate);
      categoryCounts[candidate.category] = (categoryCounts[candidate.category] || 0) + 1;
    }
  }

  // Second pass: fill remaining slots
  for (const candidate of shuffled) {
    if (picks.length >= needed) break;
    if (picks.includes(candidate)) continue;

    const catCount = categoryCounts[candidate.category] || 0;
    if (catCount >= 2) continue; // max 2 from any category in pool picks

    picks.push(candidate);
    categoryCounts[candidate.category] = catCount + 1;
  }

  return picks;
}

function assignToYears(
  scenarios: Scenario[],
  rng: RNG,
): YearSlot[] {
  // Sort scenarios by how constrained their year_range is (tightest first)
  const sorted = [...scenarios].sort((a, b) => {
    const rangeA = a.year_range[1] - a.year_range[0];
    const rangeB = b.year_range[1] - b.year_range[0];
    return rangeA - rangeB;
  });

  // Track how many scenarios each year has (max 2)
  const yearCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const assignments: YearSlot[] = [];

  for (const scenario of sorted) {
    const [minYear, maxYear] = scenario.year_range;

    // Find available years within range
    const availableYears: number[] = [];
    for (let y = minYear; y <= maxYear; y++) {
      if (yearCounts[y] < 2) {
        availableYears.push(y);
      }
    }

    if (availableYears.length === 0) {
      // Fallback: find any year with space
      for (let y = 1; y <= 5; y++) {
        if (yearCounts[y] < 2) {
          availableYears.push(y);
          break;
        }
      }
    }

    // Pick a random available year
    const chosenYear = availableYears[Math.floor(rng() * availableYears.length)];
    yearCounts[chosenYear]++;

    assignments.push({
      year: chosenYear,
      scenario_id: scenario.id,
      is_conditional: false,
    });
  }

  return assignments;
}

function reserveFollowUpSlots(assignments: YearSlot[]): YearSlot[] {
  const result = [...assignments];

  for (const slot of assignments) {
    const scenario = getScenarioById(slot.scenario_id);
    if (!scenario?.is_multi_round || !scenario.follow_up_scenario_id) continue;

    const followUp = getScenarioById(scenario.follow_up_scenario_id);
    if (!followUp) continue;

    // Place follow-up in the next year (or within its year_range)
    const targetYear = Math.min(slot.year + 1, followUp.year_range[1]);
    result.push({
      year: targetYear,
      scenario_id: followUp.id,
      is_conditional: true,
    });
  }

  return result;
}

function randomiseWithinYears(slots: YearSlot[], rng: RNG): YearSlot[] {
  // Group by year
  const byYear: Record<number, YearSlot[]> = {};
  for (const slot of slots) {
    if (!byYear[slot.year]) byYear[slot.year] = [];
    byYear[slot.year].push(slot);
  }

  // Check no consecutive market shocks and randomise within years
  const result: YearSlot[] = [];
  for (let y = 1; y <= 5; y++) {
    const yearSlots = byYear[y] || [];
    // Shuffle within year
    yearSlots.sort(() => rng() - 0.5);

    // Check for consecutive market shocks
    if (result.length > 0 && yearSlots.length > 0) {
      const lastScenario = getScenarioById(result[result.length - 1].scenario_id);
      const firstInYear = getScenarioById(yearSlots[0].scenario_id);
      if (
        lastScenario?.category === 'market' &&
        firstInYear?.category === 'market' &&
        yearSlots.length >= 2
      ) {
        // Swap order to avoid consecutive market shocks
        [yearSlots[0], yearSlots[1]] = [yearSlots[1], yearSlots[0]];
      }
    }

    result.push(...yearSlots);
  }

  return result;
}
