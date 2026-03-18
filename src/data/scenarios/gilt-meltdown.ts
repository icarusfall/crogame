import type { Scenario } from '../../types/scenario.js';

export const giltMeltdown: Scenario = {
  id: 'gilt_meltdown',
  title: 'The Gilt Market Meltdown',
  category: 'market',
  division: 'SAM',
  year_range: [3, 4],
  is_tentpole: true,
  illustration_key: 'gilt_meltdown',
  setup_text:
    "Breaking news: The Chancellor has addressed a packed House of Commons with a bold new fiscal strategy. " +
    "'We borrow a truly enormous amount of money,' she explains to stunned MPs. 'The only thing I ask is that nobody mentions it.' " +
    "She gestures towards the press gallery, which is already live-tweeting. " +
    "She then sits down and appears to briefly lose motor function.\n\n" +
    "Gilt yields, already elevated after months of Middle Eastern tensions, spike 200bps in three days. " +
    "Your LDI funds entered this with 250bps of headroom. They now have 50bps. " +
    "Your phone is ringing. It is all of the phones, actually.",
  random_params: {
    further_gilt_move: { type: 'uniform', min: 50, max: 400, unit: 'bps' },
    boe_intervention: { type: 'bernoulli', probability: 0.15 },
  },
  options: [
    {
      id: 'gilt_meltdown_opt1',
      label: 'Close out immediately at 50bps headroom',
      description:
        "Enforce collateral agreements to the letter. Clients who haven't posted get closed out. " +
        "Contractually clean but crystallises losses at potentially the worst moment.",
      consequences: {
        solvency_ratio: -5,
        cumulative_pnl: -12,
        board_confidence: 3,
        reputation: -15,
        regulatory_standing: 0,
      },
      // This option does NOT depend on the random gilt move — positions already closed
      narrative_snippet:
        "You closed out immediately. Contractually impeccable. Clients called it ruthless. " +
        "The Head of Institutional Retirement watched the SIR pipeline evaporate in real time. " +
        "'The manager who pulled the plug,' one consultant wrote. He wasn't wrong.",
      conditional_consequences: [
        {
          condition: 'yield_grab_leverage === true',
          impact: { solvency_ratio: -15, cumulative_pnl: -30 },
        },
      ],
      compounding_effects: [
        { key: 'gilt_response', value: 'closed_out' },
        { key: 'sir_pipeline_damaged', value: true },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'gilt_meltdown_opt2',
      label: 'Set a hard floor at 25bps — carry clients to there, then close',
      description:
        "Extra time for clients with a defined stop-loss. Pragmatic middle ground.",
      consequences: {
        solvency_ratio: -8,
        cumulative_pnl: -10,
        board_confidence: 2,
        reputation: -5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Modest further move — most clients post in time
        {
          condition: 'further_gilt_move < 150',
          impact: { solvency_ratio: 3, cumulative_pnl: 5, reputation: 5 },
        },
        // BoE intervenes — good outcome
        {
          condition: 'boe_intervention === true',
          impact: { solvency_ratio: 5, cumulative_pnl: 10, reputation: 10, board_confidence: 5 },
        },
        // Severe further move — painful but not catastrophic
        {
          condition: 'further_gilt_move > 250',
          impact: { solvency_ratio: -10, cumulative_pnl: -20, reputation: -5 },
        },
        // Leverage makes it worse
        {
          condition: 'yield_grab_leverage === true',
          impact: { solvency_ratio: -20, cumulative_pnl: -40 },
        },
        // Systems funded = better execution
        {
          condition: 'systems_funded === true',
          impact: { solvency_ratio: 3, cumulative_pnl: 5 },
        },
      ],
      narrative_snippet:
        "You set a hard floor at 25bps and gave clients time to post. " +
        "A pragmatist's call — neither hero nor villain.",
      conditional_narrative: [
        {
          condition: 'boe_intervention === true',
          snippet: " Then the Bank of England intervened. Yields reversed 100bps. Your patience was rewarded handsomely.",
        },
        {
          condition: 'further_gilt_move > 300',
          snippet: " Gilts kept falling. And falling. The floor at 25bps was hit faster than anyone expected. Some clients didn't make it.",
        },
      ],
      compounding_effects: [
        { key: 'gilt_response', value: 'hard_floor' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'gilt_meltdown_opt3',
      label: 'Carry everyone — we ride this out',
      description:
        "Fund all client positions from the firm's balance sheet. " +
        "Betting on mean reversion or BoE intervention.",
      consequences: {
        solvency_ratio: -5,
        cumulative_pnl: -5,
        board_confidence: -3,
        reputation: 5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // BoE intervenes — you're a hero
        {
          condition: 'boe_intervention === true',
          impact: { solvency_ratio: 10, cumulative_pnl: 20, reputation: 20, board_confidence: 15 },
        },
        // Modest further move — manageable
        {
          condition: 'further_gilt_move < 150',
          impact: { solvency_ratio: -5, cumulative_pnl: -10 },
        },
        // Severe further move — enormous balance sheet hole
        {
          condition: 'further_gilt_move > 250',
          impact: { solvency_ratio: -30, cumulative_pnl: -60, board_confidence: -10 },
        },
        // Very severe — potential firm-ender
        {
          condition: 'further_gilt_move > 350',
          impact: { solvency_ratio: -20, cumulative_pnl: -40 },
        },
        // Leverage multiplier — existential
        {
          condition: 'yield_grab_leverage === true',
          impact: { solvency_ratio: -35, cumulative_pnl: -80, board_confidence: -15 },
        },
      ],
      narrative_snippet:
        "You funded everyone from the balance sheet. Bold. The CFO went pale. " +
        "'We're betting the firm,' he said. 'We're supporting our clients,' you corrected.",
      conditional_narrative: [
        {
          condition: 'boe_intervention === true',
          snippet: " The Bank of England intervened. Yields reversed. You looked like a genius. " +
            "The CFO bought you a very expensive lunch and said nothing about it.",
        },
        {
          condition: 'further_gilt_move > 300',
          snippet: " Gilt yields rose a further {further_gilt_move}bps. Your decision to carry all clients " +
            "looked brave for approximately forty-eight hours, at which point it began to look like something else entirely.",
        },
        {
          condition: 'yield_grab_leverage === true',
          snippet: " The leveraged gilt position amplified every basis point of movement. " +
            "The Head of Internal Ratings did not say 'I told you so.' She didn't need to.",
        },
      ],
      compounding_effects: [
        { key: 'gilt_response', value: 'carry_all' },
      ],
      strategy_alignment: 'growth',
    },
    {
      id: 'gilt_meltdown_opt4',
      label: 'Carry to 25bps publicly, but quietly reduce worst exposures',
      description:
        "Shrewd but risky. Execution risk in thin markets. " +
        "Reputational risk if clients discover selective position reduction.",
      consequences: {
        solvency_ratio: -5,
        cumulative_pnl: -8,
        board_confidence: 3,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Leak risk: 25% normally, 10% with systems upgrade
        {
          condition: 'systems_funded === true',
          impact: { reputation: 2 }, // cleaner execution
        },
        // Severe move — still exposed on non-reduced positions
        {
          condition: 'further_gilt_move > 250',
          impact: { solvency_ratio: -12, cumulative_pnl: -25, reputation: -5 },
        },
        // BoE intervention — good but you've already reduced exposure
        {
          condition: 'boe_intervention === true',
          impact: { solvency_ratio: 5, cumulative_pnl: 8, reputation: 5, board_confidence: 3 },
        },
        // Leverage
        {
          condition: 'yield_grab_leverage === true',
          impact: { solvency_ratio: -15, cumulative_pnl: -30 },
        },
      ],
      narrative_snippet:
        "You told the market you were carrying everyone to 25bps. Meanwhile, your trading desk was quietly " +
        "unwinding the worst exposures. Shrewd, if nobody noticed.",
      conditional_narrative: [
        {
          condition: 'systems_funded !== true',
          snippet: " Without upgraded systems, the desk was executing blind in places. A client adviser noticed unusual activity. " +
            "An awkward phone call followed.",
        },
        {
          condition: 'boe_intervention === true',
          snippet: " The BoE intervened. You'd already reduced some positions — less upside than pure carry, " +
            "but you'd also hedged the downside. The smart money recognised what you'd done.",
        },
      ],
      compounding_effects: [
        { key: 'gilt_response', value: 'quiet_reduction' },
        { key: 'quiet_reduction_leak_risk', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'gilt_meltdown_opt5',
      label: 'Fund everyone AND take on mandates from other managers closing clients',
      description:
        "The aggressive play. Use the crisis as a growth opportunity. " +
        "If BoE intervenes: spectacular. If not: potentially firm-ending.",
      consequences: {
        solvency_ratio: -10,
        cumulative_pnl: -15,
        board_confidence: -5,
        reputation: 10,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // BoE intervenes — spectacular win
        {
          condition: 'boe_intervention === true',
          impact: { solvency_ratio: 20, cumulative_pnl: 60, reputation: 25, board_confidence: 25 },
        },
        // Modest further move — stretched but survivable
        {
          condition: 'further_gilt_move < 150',
          impact: { solvency_ratio: -10, cumulative_pnl: -20 },
        },
        // Severe further move — doubled down on a loser
        {
          condition: 'further_gilt_move > 200',
          impact: { solvency_ratio: -40, cumulative_pnl: -100, board_confidence: -20, reputation: -15 },
        },
        // Very severe — almost certainly firm-ending
        {
          condition: 'further_gilt_move > 300',
          impact: { solvency_ratio: -30, cumulative_pnl: -60 },
        },
        // Leverage makes the aggressive play even more extreme
        {
          condition: 'yield_grab_leverage === true',
          impact: { solvency_ratio: -40, cumulative_pnl: -100 },
        },
      ],
      narrative_snippet:
        "You didn't just carry your own clients — you called every competitor's pension fund desk " +
        "and offered to take on their refugees. Go big or go home.",
      conditional_narrative: [
        {
          condition: 'boe_intervention === true',
          snippet: " The Bank of England intervened. AUM up 30%. Market share gained for a decade. " +
            "The FT called it 'the trade of the crisis.' The CEO gave a speech about strategic courage. " +
            "You said nothing. The Head of Internal Ratings raised an eyebrow. Just the one.",
        },
        {
          condition: 'further_gilt_move > 250',
          snippet: " Gilts kept falling. You had doubled down on a losing position with other people's money added to your own. " +
            "The CFO stopped speaking to you. The CEO stopped making eye contact. " +
            "The PRA started making phone calls.",
        },
      ],
      compounding_effects: [
        { key: 'gilt_response', value: 'aggressive_growth' },
      ],
      strategy_alignment: 'aggressive',
    },
  ],
  preconditions: [
    {
      key: 'yield_grab_leverage',
      setup_text_modifier:
        "Breaking news: The Chancellor has addressed a packed House of Commons with a bold new fiscal strategy. " +
        "'We borrow a truly enormous amount of money,' she explains to stunned MPs. 'The only thing I ask is that nobody mentions it.' " +
        "She gestures towards the press gallery, which is already live-tweeting. " +
        "She then sits down and appears to briefly lose motor function.\n\n" +
        "Gilt yields, already elevated after months of Middle Eastern tensions, spike 200bps in three days. " +
        "Your LDI funds entered this with 250bps of headroom — but your leveraged gilt position means the " +
        "effective exposure is much larger than the headline number suggests. You now have 50bps of headroom " +
        "on a portfolio that's roughly twice the size it should be. " +
        "Your phone is ringing. It is all of the phones, actually.\n\n" +
        "The Head of Internal Ratings is standing in your doorway. She doesn't say anything. She doesn't need to.",
    },
    {
      key: 'systems_funded',
      option_modifiers: [
        {
          option_id: 'gilt_meltdown_opt2',
          consequence_adjustments: { solvency_ratio: 3 },
          narrative_override:
            "You set a hard floor at 25bps and gave clients time to post. " +
            "The upgraded systems gave your desk real-time visibility on every position — " +
            "you could see exactly who was close to the line and manage the queue. A pragmatist's call, well executed.",
        },
        {
          option_id: 'gilt_meltdown_opt4',
          consequence_adjustments: { reputation: 3 },
        },
      ],
    },
  ],
};
