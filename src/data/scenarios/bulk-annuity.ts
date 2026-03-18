import type { Scenario } from '../../types/scenario.js';

export const bulkAnnuityPricing: Scenario = {
  id: 'bulk_annuity_pricing',
  title: 'The Pricing Squeeze',
  category: 'stakeholder',
  division: 'SIR',
  year_range: [1, 3],
  is_tentpole: true,
  illustration_key: 'bulk_annuity',
  setup_text:
    "The Head of Institutional Retirement has asked for thirty minutes. She needs sixty, but knows " +
    "better than to say so.\n\n" +
    "'We've lost the last four bulk annuity pitches,' she begins. 'Rothesay. Athene. " +
    "PIC. And something called Hermes Re, which appears to be three people in Bermuda " +
    "with a spreadsheet and a dream.' She pulls up a chart. 'Our pricing is 3-5% above market " +
    "on every deal over £500m. We are being told, politely but consistently, that our numbers don't work.'\n\n" +
    "The problem, she explains, is the discount rate. Steadfast prices liabilities using a matching adjustment " +
    "portfolio of investment-grade credit — gilts, corporate bonds, secured lending. Safe, predictable, " +
    "and Solvency II efficient. But the competitors have moved to private assets: infrastructure debt, " +
    "real estate lending, equity release mortgages, even ground rents. Assets with an illiquidity premium " +
    "that, if you believe the numbers, justify a higher discount rate — and therefore a lower price to the " +
    "pension scheme.\n\n" +
    "'Some of these firms are running their asset portfolios through Bermuda reinsurance vehicles,' " +
    "she continues. 'Less capital. Different regulatory lens. We can't replicate their structures " +
    "without the PRA asking a lot of questions we'd rather not answer.'\n\n" +
    "The CFO, who has been listening, leans forward. 'The pipeline for this year is £3bn. If we win " +
    "even half of that, it transforms the division. If we don't adjust our pricing, " +
    "the pipeline is worth precisely nothing.'\n\n" +
    "The Head of Internal Ratings catches your eye. She has opinions about illiquidity premia. " +
    "She has opinions about most things.\n\n" +
    "'The question,' says the Head of Institutional Retirement, 'is whether we're going to " +
    "compete in this market or watch it from the sidelines.'",
  random_params: {
    // Determines how the private/alternative assets actually perform over time
    // 'strong' = illiquidity premium materialises, good returns
    // 'moderate' = returns slightly below assumptions, manageable
    // 'poor' = defaults and write-downs, bad underwriting exposed
    asset_performance: {
      type: 'discrete',
      outcomes: [
        { value: 'strong', weight: 1 },    // ~33%
        { value: 'moderate', weight: 1 },   // ~33%
        { value: 'poor', weight: 1 },       // ~33%
      ],
    },
    // Size of the deal won (affects magnitude of consequences)
    deal_size: { type: 'uniform', min: 800, max: 2500, unit: 'million' },
  },
  options: [
    {
      id: 'bulk_annuity_opt1',
      label: 'Hold the line — IG credit matching, accept we lose the pitches',
      description:
        "Continue pricing on investment-grade matching adjustment portfolios. " +
        "The maths is sound, the capital is efficient, and the PRA can't fault it. " +
        "But the pipeline dies and the division shrinks.",
      consequences: {
        solvency_ratio: 2,
        cumulative_pnl: -5,
        board_confidence: -8,
        reputation: -3,
        regulatory_standing: 0,
      },
      narrative_snippet:
        "You held the pricing line. Investment-grade credit, full matching, no cleverness. " +
        "The Head of Institutional Retirement lost three pitches in a row. Her team started updating LinkedIn. " +
        "The CFO presented a slide at the board showing competitor market share growing while yours shrank. " +
        "He didn't say anything. He didn't need to. The slide had an arrow on it. It pointed down.",
      conditional_consequences: [],
      compounding_effects: [
        { key: 'bulk_annuity_choice', value: 'hold_line' },
        { key: 'bulk_annuity_private_assets', value: false },
        { key: 'sir_pipeline_shrinking', value: true },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'bulk_annuity_opt2',
      label: 'Moderate shift — 20% into infrastructure debt and secured lending',
      description:
        "Move a fifth of the backing portfolio into higher-yielding but still relatively safe " +
        "private assets. Infrastructure debt and secured real estate lending with strong covenants. " +
        "Closes the pricing gap by 1-2%. Won't match the PE firms, but gets you into the conversation.",
      consequences: {
        solvency_ratio: -2,
        cumulative_pnl: 12,
        board_confidence: 2,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'asset_performance === strong',
          impact: { solvency_ratio: 3, cumulative_pnl: 15, board_confidence: 5 },
        },
        {
          condition: 'asset_performance === moderate',
          impact: { cumulative_pnl: -3, board_confidence: -2 },
        },
        {
          condition: 'asset_performance === poor',
          impact: { solvency_ratio: -5, cumulative_pnl: -12, board_confidence: -5, regulatory_standing: 1 },
        },
      ],
      narrative_snippet:
        "You approved a measured shift: 20% of backing assets into infrastructure debt and secured lending. " +
        "The Head of Internal Ratings spent two months reviewing every position. She approved most of them. " +
        "The pricing gap closed enough to win one mid-sized deal.",
      conditional_narrative: [
        {
          condition: 'asset_performance === strong',
          snippet: " The private assets performed well. The illiquidity premium was real, " +
            "and the underwriting was solid. The Head of Institutional Retirement won two more deals the following year. " +
            "The CFO recalculated the division's return on capital and smiled for the first time since 2019.",
        },
        {
          condition: 'asset_performance === moderate',
          snippet: " Returns came in slightly below the original assumptions. Not a disaster, " +
            "but the margin on the deal was thinner than the board had expected. " +
            "The Head of Internal Ratings said 'I told you the spread was too tight' in a tone that suggested " +
            "she had been rehearsing the line.",
        },
        {
          condition: 'asset_performance === poor',
          snippet: " Two of the real estate lending positions defaulted in year three. " +
            "The infrastructure debt was fine, but the secured lending book had been underwritten " +
            "by an originator who turned out to have a creative relationship with the word 'secured.' " +
            "The Head of Internal Ratings produced the memo she'd written eighteen months earlier. " +
            "It was devastatingly specific.",
        },
      ],
      compounding_effects: [
        { key: 'bulk_annuity_choice', value: 'moderate_shift' },
        { key: 'bulk_annuity_private_assets', value: true },
        { key: 'bulk_annuity_private_allocation', value: 0.2 },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'bulk_annuity_opt3',
      label: 'Aggressive shift — 45% private assets, match the PE firm pricing',
      description:
        "Infrastructure debt, equity release mortgages, ground rents, real estate lending. " +
        "Go head-to-head with Rothesay and PIC on pricing. " +
        "The Head of Internal Ratings will need more resources to rate this volume. " +
        "The PRA will want to understand the matching adjustment treatment.",
      consequences: {
        solvency_ratio: -5,
        cumulative_pnl: 25,
        board_confidence: 8,
        reputation: 3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'asset_performance === strong',
          impact: { solvency_ratio: 5, cumulative_pnl: 40, board_confidence: 10, reputation: 5 },
        },
        {
          condition: 'asset_performance === moderate',
          impact: { solvency_ratio: -5, cumulative_pnl: -10, board_confidence: -5 },
        },
        {
          condition: 'asset_performance === poor',
          impact: { solvency_ratio: -15, cumulative_pnl: -35, board_confidence: -12, regulatory_standing: 2, reputation: -10 },
        },
      ],
      narrative_snippet:
        "You went aggressive. Nearly half the backing portfolio shifted into private assets. " +
        "The pricing gap closed. You won a £{deal_size}m deal in the first quarter. " +
        "The Head of Institutional Retirement was delighted. The Head of Internal Ratings requested " +
        "three additional analysts. You gave her one.",
      conditional_narrative: [
        {
          condition: 'asset_performance === strong',
          snippet: " The assets delivered. The illiquidity premium was real and the underwriting held up. " +
            "Market share grew. The board started talking about Steadfast as 'a serious player in BPA.' " +
            "The PRA asked questions. You had good answers.",
        },
        {
          condition: 'asset_performance === moderate',
          snippet: " Returns were acceptable but below the assumptions baked into pricing. " +
            "The margin on the book of business turned negative in year three. " +
            "The CFO pointed out that you'd won a lot of business at prices that now looked generous. " +
            "'We're the market leader in unprofitable annuities,' he observed.",
        },
        {
          condition: 'asset_performance === poor',
          snippet: " The equity release mortgages performed as expected, but the real estate lending book " +
            "and two infrastructure positions suffered significant defaults. The matching adjustment " +
            "on the portfolio no longer met PRA tests. A section 166 review was commissioned. " +
            "The Head of Internal Ratings resigned. She cited 'irreconcilable differences with reality.'",
        },
      ],
      compounding_effects: [
        { key: 'bulk_annuity_choice', value: 'aggressive_shift' },
        { key: 'bulk_annuity_private_assets', value: true },
        { key: 'bulk_annuity_private_allocation', value: 0.45 },
        { key: 'pra_ma_scrutiny', value: true },
      ],
      strategy_alignment: 'growth',
    },
    {
      id: 'bulk_annuity_opt4',
      label: 'Back the portfolio with leveraged gilts instead',
      description:
        "A different approach: rather than private assets, use gilt leverage to generate " +
        "higher returns on the matching portfolio. Keeps assets liquid and ratable, " +
        "but introduces duration and leverage risk. " +
        "If gilt yields spike, the collateral calls could be severe.",
      consequences: {
        solvency_ratio: -3,
        cumulative_pnl: 15,
        board_confidence: 3,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'asset_performance === strong',
          impact: { solvency_ratio: 2, cumulative_pnl: 10, board_confidence: 3 },
        },
        {
          condition: 'asset_performance === moderate',
          impact: { cumulative_pnl: -5 },
        },
        {
          condition: 'asset_performance === poor',
          impact: { solvency_ratio: -8, cumulative_pnl: -15, board_confidence: -5 },
        },
      ],
      narrative_snippet:
        "You went with leveraged gilts. Clean, liquid, ratable. The Head of Internal Ratings " +
        "approved without reservation, which should have made you suspicious. " +
        "The pricing was competitive enough to win some business. " +
        "The leverage, of course, would need to be unwound if gilt yields moved sharply. " +
        "But when had gilt yields ever moved sharply?",
      conditional_narrative: [
        {
          condition: 'asset_performance === poor',
          snippet: " The leverage worked against you when credit spreads widened, " +
            "increasing collateral requirements at exactly the wrong moment.",
        },
      ],
      compounding_effects: [
        { key: 'bulk_annuity_choice', value: 'leveraged_gilts' },
        { key: 'yield_grab_leverage', value: true },
        { key: 'bulk_annuity_private_assets', value: false },
        { key: 'bulk_annuity_gilt_leverage', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
    {
      id: 'bulk_annuity_opt5',
      label: 'Pivot — focus on smaller schemes where we can still compete on service',
      description:
        "Concede the large deals to the PE firms. Refocus the division on sub-£500m schemes " +
        "where relationships and service quality still matter more than raw pricing. " +
        "Lower revenue, lower risk, but the board wanted growth.",
      consequences: {
        solvency_ratio: 1,
        cumulative_pnl: -3,
        board_confidence: -6,
        reputation: 5,
        regulatory_standing: 0,
      },
      narrative_snippet:
        "You pivoted to smaller schemes. The maths worked better at that scale — " +
        "less price-sensitive clients, relationships that mattered, consultants who valued " +
        "the service proposition over three basis points. " +
        "The Head of Institutional Retirement was initially horrified, then pragmatic, then surprisingly effective. " +
        "The board, however, had been promised growth. This was not growth. " +
        "This was a very well-managed retreat.",
      conditional_narrative: [
        {
          condition: 'asset_performance === poor',
          snippet: " When the PE-backed competitors started reporting asset write-downs two years later, " +
            "your decision to step back from the large deals looked prescient. " +
            "The FT ran a piece about 'the insurer that saw it coming.' You hadn't seen it coming. " +
            "You'd been outbid. But you took the compliment.",
        },
      ],
      compounding_effects: [
        { key: 'bulk_annuity_choice', value: 'pivot_small' },
        { key: 'bulk_annuity_private_assets', value: false },
        { key: 'sir_pipeline_shrinking', value: true },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
  ],
  preconditions: [
    {
      key: 'yield_grab_leverage',
      option_modifiers: [
        {
          option_id: 'bulk_annuity_opt4',
          consequence_adjustments: { board_confidence: -3 },
          narrative_override:
            "You went with leveraged gilts — again. The Head of Internal Ratings pointed out that " +
            "you were now running leverage on both the back book and the annuity portfolio. " +
            "'That is a lot of leverage,' she said, in the tone of someone who knows she will be " +
            "quoted in the post-mortem. The pricing worked. The concentration risk was substantial.",
        },
      ],
    },
  ],
};
