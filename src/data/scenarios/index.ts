import type { Scenario } from '../../types/scenario.js';
import { yieldGrab } from './yield-grab.js';
import { giltMeltdown } from './gilt-meltdown.js';
import { fourPercentRound1, fourPercentRound2, fourPercentRound3 } from './four-percent-problem.js';
import { ctoSystems } from './cto-systems.js';
import { bulkAnnuityPricing } from './bulk-annuity.js';
import { regulatorReview } from './regulator-review.js';
import { privateCreditCrunch } from './private-credit-crunch.js';
import { ftJournalist } from './ft-journalist.js';
import { ceoGrowthTargets } from './ceo-growth.js';
import { cyberAttack } from './cyber-attack.js';
import { headcountPressure } from './headcount-pressure.js';
import { modelFailure } from './model-failure.js';
import { whistleblower } from './whistleblower.js';

/** All scenario definitions, keyed by ID */
export const ALL_SCENARIOS: Record<string, Scenario> = {
  [yieldGrab.id]: yieldGrab,
  [giltMeltdown.id]: giltMeltdown,
  [fourPercentRound1.id]: fourPercentRound1,
  [fourPercentRound2.id]: fourPercentRound2,
  [fourPercentRound3.id]: fourPercentRound3,
  [ctoSystems.id]: ctoSystems,
  [bulkAnnuityPricing.id]: bulkAnnuityPricing,
  [regulatorReview.id]: regulatorReview,
  [privateCreditCrunch.id]: privateCreditCrunch,
  [ftJournalist.id]: ftJournalist,
  [ceoGrowthTargets.id]: ceoGrowthTargets,
  [cyberAttack.id]: cyberAttack,
  [headcountPressure.id]: headcountPressure,
  [modelFailure.id]: modelFailure,
  [whistleblower.id]: whistleblower,
};

/** Scenarios available for the main selection pool (excludes multi-round follow-ups) */
export function getSelectableScenarios(): Scenario[] {
  return Object.values(ALL_SCENARIOS).filter(s => !(s.is_multi_round && s.round && s.round > 1));
}

/** Get a scenario by ID */
export function getScenarioById(id: string): Scenario | undefined {
  return ALL_SCENARIOS[id];
}

export { yieldGrab, giltMeltdown, fourPercentRound1, fourPercentRound2, fourPercentRound3, ctoSystems, bulkAnnuityPricing, regulatorReview, privateCreditCrunch, ftJournalist, ceoGrowthTargets, cyberAttack, headcountPressure, modelFailure, whistleblower };
