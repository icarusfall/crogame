import type { Scenario } from '../../types/scenario.js';

export const ceoGrowthTargets: Scenario = {
  id: 'ceo_growth_targets',
  title: "The CEO's Investor Day",
  category: 'stakeholder',
  division: 'SIR',
  year_range: [1, 3],
  is_tentpole: false,
  illustration_key: 'ceo_growth',
  setup_text:
    "Caroline Westbrook, CEO, has called you to her office. She is standing behind her desk, " +
    "which means she has already made a decision and is about to tell you what it is.\n\n" +
    "'Investor day is in six weeks,' she says. 'I'm going to commit to 20% AUM growth over three years. " +
    "The analysts want a number. I'm giving them a number.'\n\n" +
    "She slides a deck across the desk. The risk section — your section — currently reads " +
    "'Robust risk framework supports growth ambitions.' It is on slide thirty-seven. " +
    "It says nothing else.\n\n" +
    "'I need you to sign off on this,' she says. 'And I need it by Friday.'\n\n" +
    "You pick up the deck. Twenty percent over three years is ambitious. The capital implications " +
    "depend entirely on where the growth comes from. If it's bulk annuities, the capital strain " +
    "is significant — every £1bn of new liabilities needs matching assets, capital, and risk margin. " +
    "If it's DC workplace pensions, the capital is lighter but the margins are thinner. " +
    "Caroline hasn't specified which. She just wants the big number.\n\n" +
    "The analysts briefing is already in their diaries. The slides are with the design agency. " +
    "Caroline is looking at you with the expression of someone who is not, technically, asking a question.",
  random_params: {
    // Where the growth actually comes from if targets are pursued
    growth_source: {
      type: 'discrete',
      outcomes: [
        { value: 'bulk_annuity', weight: 2 },   // ~40% — capital heavy
        { value: 'dc_workplace', weight: 2 },    // ~40% — capital light
        { value: 'mixed', weight: 1 },            // ~20% — bit of both
      ],
    },
  },
  options: [
    {
      id: 'ceo_growth_opt1',
      label: "Sign off — the risk framework does support growth",
      description:
        "Approve the slide. 20% growth is achievable with appropriate risk management. " +
        "Caroline gets her number. You're on record supporting it.",
      consequences: {
        solvency_ratio: -3,
        cumulative_pnl: 10,
        board_confidence: 8,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'growth_source === bulk_annuity',
          impact: { solvency_ratio: -8, cumulative_pnl: 15, board_confidence: 3 },
        },
        {
          condition: 'growth_source === dc_workplace',
          impact: { solvency_ratio: -2, cumulative_pnl: 5, board_confidence: 2 },
        },
        // If SIR pipeline is already shrinking from earlier choices, growth target is unrealistic
        {
          condition: 'sir_pipeline_shrinking === true',
          impact: { board_confidence: -5, reputation: -3 },
        },
      ],
      narrative_snippet:
        "You signed off. Caroline got her number. The analysts loved it. The share price ticked up 3%. " +
        "At the post-investor-day drinks, Caroline thanked you for being 'a CRO who understands commercial reality.' " +
        "You weren't entirely sure this was a compliment.",
      conditional_narrative: [
        {
          condition: 'growth_source === bulk_annuity',
          snippet: " The growth came primarily from bulk annuities. The capital strain was immediate and substantial. " +
            "The CFO started running daily solvency projections. 'We're growing into our capital buffer,' " +
            "he observed. 'That's what capital buffers are for,' Caroline replied.",
        },
        {
          condition: 'sir_pipeline_shrinking === true',
          snippet: " Hitting 20% growth with a shrinking SIR pipeline proved challenging. " +
            "By year two, the target was quietly revised to 15%. By year three, " +
            "Caroline stopped mentioning it at analyst briefings.",
        },
      ],
      compounding_effects: [
        { key: 'ceo_growth_signed_off', value: true },
        { key: 'growth_target_ambitious', value: true },
      ],
      strategy_alignment: 'growth',
    },
    {
      id: 'ceo_growth_opt2',
      label: "Push back — demand the capital plan before signing off",
      description:
        "Tell Caroline you need to see the capital implications before you can approve. " +
        "This means the slides aren't ready by Friday. She will not be pleased.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: -5,
        reputation: 3,
        regulatory_standing: 0,
      },
      narrative_snippet:
        "You told Caroline you needed a capital plan before you could sign off. " +
        "She stared at you for four seconds, which is a long time to be stared at by a CEO. " +
        "'The slides go to the design agency tomorrow,' she said. 'Then they'll go without my section,' " +
        "you replied. She left the room. The door closed with slightly more force than was necessary. " +
        "Your section was removed from the deck. Caroline presented without it. " +
        "Two analysts noted the absence of a risk sign-off in their reports. It was not a comfortable week.",
      conditional_consequences: [
        // If you've pushed back on other things too, board starts questioning your value
        {
          condition: 'conservative_choices_count >= 3',
          impact: { board_confidence: -5 },
        },
      ],
      compounding_effects: [
        { key: 'ceo_growth_signed_off', value: false },
        { key: 'ceo_relationship_strained', value: true },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'ceo_growth_opt3',
      label: "Negotiate — sign off on 12% with conditions",
      description:
        "Propose a lower target with explicit risk guardrails. Growth is supported " +
        "but within defined solvency and capital constraints. A middle path.",
      consequences: {
        solvency_ratio: -1,
        cumulative_pnl: 8,
        board_confidence: -2,
        reputation: 2,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'growth_source === bulk_annuity',
          impact: { solvency_ratio: -4, cumulative_pnl: 8 },
        },
        {
          condition: 'sir_pipeline_shrinking === true',
          impact: { board_confidence: -3 },
        },
      ],
      narrative_snippet:
        "You proposed 12% with conditions: minimum solvency ratio of 135%, quarterly capital reviews, " +
        "and a pre-agreed trigger for pausing new business. Caroline looked at your counter-proposal " +
        "the way one might look at a parking ticket. 'Twelve,' she repeated. " +
        "'With conditions,' you added. She took the slides back. The final deck said 15%. " +
        "Your conditions appeared in an appendix, in a font size that suggested they were optional. " +
        "They were not, technically, optional. But they were in very small print.",
      compounding_effects: [
        { key: 'ceo_growth_signed_off', value: true },
        { key: 'growth_target_moderate', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'ceo_growth_opt4',
      label: "Sign off, but write a private memo to the board documenting your concerns",
      description:
        "Give Caroline her number publicly. Protect yourself privately. " +
        "If it goes wrong, you're on record. If it goes right, nobody reads the memo. " +
        "If Caroline finds out about the memo, you have a different problem entirely.",
      consequences: {
        solvency_ratio: -3,
        cumulative_pnl: 10,
        board_confidence: 5,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'growth_source === bulk_annuity',
          impact: { solvency_ratio: -8, cumulative_pnl: 15 },
        },
      ],
      narrative_snippet:
        "You signed the slides and wrote the memo. The slides said 'robust risk framework supports growth.' " +
        "The memo said 'I have significant reservations about the capital implications of this target " +
        "and wish to formally record them.' You sent the memo to the company secretary. " +
        "The company secretary, who has worked with Caroline for six years, mentioned it to Caroline " +
        "within the hour. This is how companies actually work.",
      conditional_narrative: [
        {
          condition: 'growth_source === bulk_annuity',
          snippet: " When the capital strain materialised, your memo was on file. " +
            "Caroline never mentioned it. She didn't need to. The temperature in every subsequent " +
            "meeting dropped by approximately five degrees.",
        },
      ],
      compounding_effects: [
        { key: 'ceo_growth_signed_off', value: true },
        { key: 'growth_target_ambitious', value: true },
        { key: 'ceo_relationship_strained', value: true },
        { key: 'formal_memo_filed', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'ceo_growth_opt5',
      label: "Enthusiastically support — and propose going higher",
      description:
        "Tell Caroline 20% is conservative. Propose 25% with an acquisition strategy. " +
        "Bold, attention-getting, and potentially career-defining in either direction.",
      consequences: {
        solvency_ratio: -5,
        cumulative_pnl: 15,
        board_confidence: 5,
        reputation: 3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'growth_source === bulk_annuity',
          impact: { solvency_ratio: -12, cumulative_pnl: 20, board_confidence: -5 },
        },
        {
          condition: 'growth_source === dc_workplace',
          impact: { solvency_ratio: -3, cumulative_pnl: 10 },
        },
        {
          condition: 'sir_pipeline_shrinking === true',
          impact: { board_confidence: -15, reputation: -5, cumulative_pnl: -10 },
        },
      ],
      narrative_snippet:
        "You didn't just sign off — you told Caroline she was being too cautious. " +
        "'Twenty percent? We should be targeting twenty-five with a bolt-on acquisition.' " +
        "Caroline looked at you as if seeing you for the first time. 'I knew I hired you for a reason,' " +
        "she said. The final deck said 25%. The risk section was three slides long and mentioned the word " +
        "'opportunity' eleven times. The Head of Internal Ratings read it and requested a meeting " +
        "with the company secretary about the CRO role's statutory responsibilities.",
      compounding_effects: [
        { key: 'ceo_growth_signed_off', value: true },
        { key: 'growth_target_ambitious', value: true },
        { key: 'cro_pushed_growth', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
  ],
  preconditions: [],
};
