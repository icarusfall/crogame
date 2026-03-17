import type { RandomParamDef } from '../types/scenario.js';

export type RNG = () => number;

export function defaultRNG(): number {
  return Math.random();
}

export function rollRandomParams(
  paramDefs: Record<string, RandomParamDef>,
  rng: RNG = defaultRNG,
): Record<string, number | boolean | string> {
  const result: Record<string, number | boolean | string> = {};

  for (const [key, def] of Object.entries(paramDefs)) {
    switch (def.type) {
      case 'uniform': {
        const min = def.min ?? 0;
        const max = def.max ?? 1;
        const raw = min + rng() * (max - min);
        // Round to reasonable precision based on magnitude
        if (max - min >= 100) {
          result[key] = Math.round(raw);
        } else if (max - min >= 1) {
          result[key] = Math.round(raw * 10) / 10;
        } else {
          result[key] = Math.round(raw * 100) / 100;
        }
        break;
      }
      case 'bernoulli': {
        const probability = def.probability ?? 0.5;
        result[key] = rng() < probability;
        break;
      }
      case 'discrete': {
        if (!def.outcomes || def.outcomes.length === 0) {
          result[key] = '';
          break;
        }
        const totalWeight = def.outcomes.reduce((sum, o) => sum + o.weight, 0);
        let roll = rng() * totalWeight;
        for (const outcome of def.outcomes) {
          roll -= outcome.weight;
          if (roll <= 0) {
            result[key] = outcome.value;
            break;
          }
        }
        // Fallback to last outcome
        if (result[key] === undefined) {
          result[key] = def.outcomes[def.outcomes.length - 1].value;
        }
        break;
      }
    }
  }

  return result;
}
