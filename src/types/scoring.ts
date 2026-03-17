export type RegulatoryLevel = 'green' | 'amber' | 'red';

export interface ScoreDimensions {
  solvency_ratio: number;        // Percentage, starts 150
  cumulative_pnl: number;        // GBP millions, starts 0
  regulatory_standing: RegulatoryLevel;
  regulatory_flags: number;      // Count: 0=green, 1-2=amber, 3+=red
  reputation: number;            // 0-100, starts 75
  board_confidence: number;      // 0-100, starts 70
}
