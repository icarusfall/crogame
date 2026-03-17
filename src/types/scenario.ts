export type Category = 'stakeholder' | 'market' | 'operational' | 'curveball';
export type Division = 'SAM' | 'SIR' | 'SW' | 'group';
export type StrategyAlignment = 'conservative' | 'balanced' | 'growth' | 'aggressive';

export interface RandomParamDef {
  type: 'uniform' | 'bernoulli' | 'discrete';
  // For uniform: continuous range
  min?: number;
  max?: number;
  unit?: string;
  // For bernoulli: probability of true
  probability?: number;
  // For discrete: weighted outcomes
  outcomes?: Array<{ value: string; weight: number }>;
}

export interface ScoreImpact {
  solvency_ratio?: number;
  cumulative_pnl?: number;
  regulatory_standing?: number; // +1 = add flag, -1 = remove flag
  reputation?: number;
  board_confidence?: number;
}

export interface ConditionalModifier {
  key: string;
  value: string | number | boolean;
}

export interface ConditionalConsequence {
  condition: string;
  impact: ScoreImpact;
}

export interface ConditionalNarrative {
  condition: string;
  snippet: string;
}

export interface SubChoice {
  id: string;
  label: string;
  description: string;
  consequences: ScoreImpact;
  conditional_consequences?: ConditionalConsequence[];
  narrative_snippet: string;
  conditional_narrative?: ConditionalNarrative[];
  compounding_effects: ConditionalModifier[];
  strategy_alignment: StrategyAlignment;
}

export interface Option {
  id: string;
  label: string;
  description: string;
  consequences: ScoreImpact;
  conditional_consequences?: ConditionalConsequence[];
  narrative_snippet: string;
  conditional_narrative?: ConditionalNarrative[];
  compounding_effects: ConditionalModifier[];
  sub_choices?: SubChoice[];
  strategy_alignment: StrategyAlignment;
}

export interface OptionModifier {
  option_id: string;
  consequence_adjustments: ScoreImpact;
  narrative_override?: string;
}

export interface Precondition {
  key: string;
  setup_text_modifier?: string;
  option_modifiers?: OptionModifier[];
}

export interface Scenario {
  id: string;
  title: string;
  category: Category;
  division: Division;
  year_range: [number, number];
  is_tentpole: boolean;
  illustration_key: string;
  setup_text: string;
  random_params: Record<string, RandomParamDef>;
  options: Option[];
  preconditions: Precondition[];
  is_multi_round?: boolean;
  round?: number;
  follow_up_scenario_id?: string;
  follow_up_condition?: string;
}

/** What the player sees — no consequence details */
export interface PresentedScenario {
  id: string;
  title: string;
  category: Category;
  division: Division;
  year: number;
  illustration_key: string;
  setup_text: string;
  options: Array<{
    id: string;
    label: string;
    description: string;
    sub_choices?: Array<{
      id: string;
      label: string;
      description: string;
    }>;
  }>;
}
