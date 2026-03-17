import type { Scenario } from '../../types/scenario.js';

export const yieldGrab: Scenario = {
  id: 'yield_grab',
  title: 'The Yield Grab',
  category: 'stakeholder',
  division: 'SAM',
  year_range: [1, 2],
  is_tentpole: true,
  illustration_key: 'scene_boardroom',
  setup_text:
    "The CFO has called an unscheduled meeting. He's brought slides. This is never good.\n\n" +
    "'Sphinx Insurance,' he begins, tapping a chart showing their back-book returns, " +
    "'are getting {sphinx_outperformance}bps more than us on comparable liabilities. {sphinx_outperformance}.' " +
    "He lets this hang in the air.\n\n" +
    "'The board is asking what we're doing differently. The answer, apparently, is being conservative.' " +
    "He turns to you. 'I'm not asking us to do anything crazy. I'm asking whether our risk appetite is still fit for purpose.'\n\n" +
    "The Head of Internal Ratings catches your eye from across the table. She is doing the thing with her eyebrows.",
  random_params: {
    sphinx_outperformance: { type: 'uniform', min: 60, max: 120, unit: 'bps' },
  },
  options: [
    {
      id: 'yield_grab_opt1',
      label: 'Hold the line — our risk appetite is correct',
      description:
        'Tell the CFO the current allocation is deliberate and board-approved. ' +
        'Sphinx can explain their returns to the PRA when the cycle turns.',
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 10,
        board_confidence: -5,
        reputation: 0,
        regulatory_standing: 0,
      },
      narrative_snippet:
        'You held the line on asset quality. The CFO started going around you to the CEO. ' +
        "The Head of Internal Ratings bought you a coffee, which from her is essentially a marriage proposal.",
      conditional_narrative: [
        {
          condition: 'conservative_choices_count >= 3',
          snippet: ' The board was beginning to wonder what exactly you were for.',
        },
      ],
      compounding_effects: [
        { key: 'yield_grab_choice', value: 'hold' },
        { key: 'private_credit_exposure', value: 0 },
        { key: 'conservative_choices_count', value: 1 },
        { key: 'cfo_frustrated', value: true },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'yield_grab_opt2',
      label: 'Expand private credit — but only what we can rate internally',
      description:
        'Agree to increase yield through infrastructure debt and carefully selected private assets ' +
        'that the internal ratings team can properly assess. Captures ~25-30bps.',
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 12,
        board_confidence: 3,
        reputation: 0,
        regulatory_standing: 0,
      },
      narrative_snippet:
        'You approved a measured expansion into private credit, anchored by the internal ratings team. ' +
        "The CFO got some of what he wanted. Your Head of Internal Ratings muttered that the infrastructure debt was fine " +
        "but she had concerns about two of the real estate positions. She was, annoyingly, correct.",
      compounding_effects: [
        { key: 'yield_grab_choice', value: 'moderate' },
        { key: 'private_credit_exposure', value: 0.25 },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'yield_grab_opt3',
      label: 'Go bigger — increase high yield and lower-rated private credit',
      description:
        'Approve a 15% shift from IG into HY credit and BB-rated private assets. ' +
        'Yield pickup of 60-70bps. MA benefit on some assets is questionable.',
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 30,
        board_confidence: 5,
        reputation: 0,
        regulatory_standing: 1,
      },
      narrative_snippet:
        'You approved a significant shift into higher-yielding assets. Short-term profits jumped. ' +
        "The CEO mentioned you positively at investor day. The Head of Internal Ratings wrote you a formal memo of concern, " +
        "which she filed with exquisite care.",
      compounding_effects: [
        { key: 'yield_grab_choice', value: 'aggressive' },
        { key: 'private_credit_exposure', value: 0.6 },
        { key: 'formal_memo_filed', value: true },
      ],
      strategy_alignment: 'growth',
    },
    {
      id: 'yield_grab_opt4',
      label: "Widen the fund manager's trading limits",
      description:
        "Rather than changing strategic allocation, double the tracking error budget for the portfolio manager. " +
        "The CFO has a contact — an ex-Goldman credit trader.",
      consequences: {
        // Base consequences — modified by sub-choice
        solvency_ratio: 0,
        cumulative_pnl: 15,
        board_confidence: 2,
        reputation: 0,
        regulatory_standing: 0,
      },
      narrative_snippet:
        'You widened trading limits rather than changing strategic allocation. A pragmatic middle path — or a half-measure, depending on your point of view.',
      sub_choices: [
        {
          id: 'yield_grab_opt4_existing',
          label: 'Keep existing manager',
          description:
            'The existing manager is cautious by nature. +15-20bps yield improvement. ' +
            'Risk of amplified drawdowns in fast-moving markets.',
          consequences: {
            cumulative_pnl: 15,
            board_confidence: 1,
          },
          narrative_snippet:
            'You kept the existing manager with wider limits. Steady, if unspectacular. ' +
            'The CFO looked disappointed but accepted it.',
          compounding_effects: [
            { key: 'yield_grab_choice', value: 'wider_limits' },
            { key: 'private_credit_exposure', value: 0.15 },
            { key: 'trading_limits_widened', value: true },
          ],
          strategy_alignment: 'balanced',
        },
        {
          id: 'yield_grab_opt4_goldman',
          label: 'Hire the Goldman trader',
          description:
            "Year 1 will be spectacular (+40bps). Year 2, he'll push for wider limits and call risk 'speed bumps.' " +
            'When market turns, concentrated position produces sudden large loss.',
          consequences: {
            cumulative_pnl: 40,
            board_confidence: 5,
            reputation: -5,
          },
          narrative_snippet:
            "You hired the Goldman trader. Year one was genuinely impressive. He wore his success like aftershave — " +
            "you could smell it from three floors away. The Head of Internal Ratings began eating lunch at her desk " +
            "so she wouldn't have to share a lift with him.",
          compounding_effects: [
            { key: 'yield_grab_choice', value: 'goldman_trader' },
            { key: 'yield_grab_goldman_trader', value: true },
            { key: 'private_credit_exposure', value: 0.3 },
            { key: 'trading_limits_widened', value: true },
          ],
          strategy_alignment: 'aggressive',
        },
      ],
      compounding_effects: [
        { key: 'yield_grab_choice', value: 'wider_limits' },
        { key: 'trading_limits_widened', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'yield_grab_opt5',
      label: 'Approve everything and leverage up gilts too',
      description:
        "Approve HY shift, widen trading limits, AND leverage the gilt portfolio. All in. " +
        "The CFO looks slightly alarmed, which is a first.",
      consequences: {
        solvency_ratio: -10,
        cumulative_pnl: 50,
        board_confidence: 8,
        reputation: 0,
        regulatory_standing: 1,
      },
      narrative_snippet:
        "You went all in. Returns in the first year were genuinely impressive. " +
        "The board thought you'd found free money. The Head of Internal Ratings stopped sending memos. " +
        "She updated her CV.",
      compounding_effects: [
        { key: 'yield_grab_choice', value: 'all_in' },
        { key: 'yield_grab_leverage', value: true },
        { key: 'private_credit_exposure', value: 0.8 },
        { key: 'trading_limits_widened', value: true },
        { key: 'goldman_trader_implied', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
  ],
  preconditions: [],
};
