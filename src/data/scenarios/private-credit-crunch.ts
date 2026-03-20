import type { Scenario } from '../../types/scenario.js';

export const privateCreditCrunch: Scenario = {
  id: 'private_credit_crunch',
  title: 'The Private Credit Crunch',
  category: 'market',
  division: 'SAM',
  year_range: [2, 4],
  is_tentpole: false,
  illustration_key: 'private_credit',
  setup_text:
    "It starts with a mid-tier US private equity firm. They miss a covenant on a £400m infrastructure " +
    "loan. Nobody panics. These things happen.\n\n" +
    "Then a Nordic real estate fund suspends redemptions. Then a UK private debt manager gates three funds. " +
    "Then the FT publishes a long read titled 'The Illiquidity Premium Was The Friends We Made Along The Way' " +
    "and suddenly everyone is paying attention.\n\n" +
    "Secondary market pricing for private credit — what little secondary market exists — drops 20% " +
    "in a fortnight. The fundamentals haven't changed that much: most underlying borrowers are still " +
    "paying, most assets are still performing. But confidence has evaporated and redemption queues " +
    "are growing.\n\n" +
    "You have two problems, and they are connected.\n\n" +
    "Problem one: Steadfast's balance sheet holds private credit assets. You bought these to back " +
    "insurance liabilities. You are holding them to maturity. The cashflows have not changed. " +
    "But the question of how you mark them is now politically charged.\n\n" +
    "Problem two: Steadfast Asset Management runs three private credit funds for external clients. " +
    "These funds have a combined AUM of £2.1bn. Investors are asking about valuations. " +
    "Some are asking about redemptions. If SAM marks down and triggers a wave of redemptions, " +
    "does that create a read-across to the balance sheet? If the balance sheet doesn't mark down " +
    "but the funds do, the PRA will want to know why.\n\n" +
    "The Head of Internal Ratings is at your door. She has brought a coffee. This is unprecedented " +
    "and therefore alarming.",
  random_params: {
    writedown_severity: { type: 'uniform', min: 0.10, max: 0.40, unit: 'proportion' },
    fund_redemption_wave: { type: 'bernoulli', probability: 0.45 },
  },
  options: [
    {
      id: 'private_credit_opt1',
      label: 'Mark everything to market — balance sheet and funds together',
      description:
        "Apply secondary market pricing across the board. Balance sheet and SAM funds " +
        "mark consistently. Transparent, defensible, but crystallises paper losses " +
        "and may trigger fund redemptions that force actual sales.",
      consequences: {
        solvency_ratio: -5,
        cumulative_pnl: -8,
        board_confidence: -3,
        reputation: 3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Higher exposure from yield grab = bigger hit
        {
          condition: 'private_credit_exposure > 0.5',
          impact: { solvency_ratio: -18, cumulative_pnl: -45, board_confidence: -8 },
        },
        {
          condition: 'private_credit_exposure > 0.2',
          impact: { solvency_ratio: -8, cumulative_pnl: -20 },
        },
        // Severe writedown
        {
          condition: 'writedown_severity > 0.3',
          impact: { solvency_ratio: -5, cumulative_pnl: -10 },
        },
        // Fund redemption wave makes it worse
        {
          condition: 'fund_redemption_wave === true',
          impact: { solvency_ratio: -5, cumulative_pnl: -15, reputation: -5, board_confidence: -3 },
        },
        // If you expanded internal ratings, better positioned
        {
          condition: 'systems_funded === true',
          impact: { solvency_ratio: 2, cumulative_pnl: 3 },
        },
      ],
      narrative_snippet:
        "You marked everything down. Balance sheet and funds, same basis, same day. " +
        "The CFO watched the solvency ratio drop in real time. 'Consistent,' he said. " +
        "'Expensive,' he added.",
      conditional_narrative: [
        {
          condition: 'fund_redemption_wave === true',
          snippet: " The fund markdowns triggered exactly what you feared. Three institutional investors " +
            "submitted redemption notices within forty-eight hours. The fund managers began the grim " +
            "process of finding buyers for illiquid assets in a market where everyone was selling. " +
            "The prices they got were worse than the marks.",
        },
        {
          condition: 'private_credit_exposure > 0.5',
          snippet: " The aggressive private credit allocation from the yield grab meant the balance sheet hit " +
            "was substantial. The Head of Internal Ratings drank her coffee in silence. " +
            "She had warned you. The memo was on file.",
        },
        {
          condition: 'fund_redemption_wave !== true',
          snippet: " The fund investors held their nerve. Some grumbled, but the mark-down was seen as " +
            "honest rather than panicked. Two consultants called to say they appreciated the transparency. " +
            "One of them meant it.",
        },
      ],
      compounding_effects: [
        { key: 'private_credit_response', value: 'mark_everything' },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'private_credit_opt2',
      label: 'Hold balance sheet marks, mark the funds down',
      description:
        "The balance sheet assets are held to maturity — the cashflows haven't changed, " +
        "so hold the valuation. But the funds owe their investors fair value pricing, " +
        "so mark those down. Different purpose, different methodology. " +
        "Defensible, but the PRA may question the inconsistency.",
      consequences: {
        solvency_ratio: -2,
        cumulative_pnl: -5,
        board_confidence: 2,
        reputation: -3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'private_credit_exposure > 0.5',
          impact: { regulatory_standing: 1, reputation: -5 },
        },
        {
          condition: 'private_credit_exposure > 0.2',
          impact: { reputation: -3 },
        },
        {
          condition: 'fund_redemption_wave === true',
          impact: { cumulative_pnl: -8, reputation: -5, regulatory_standing: 1, board_confidence: -3 },
        },
        // PRA already scrutinising your MA
        {
          condition: 'pra_ma_scrutiny === true',
          impact: { regulatory_standing: 1, reputation: -3 },
        },
        {
          condition: 'writedown_severity > 0.3',
          impact: { cumulative_pnl: -5, reputation: -3 },
        },
      ],
      narrative_snippet:
        "You held the balance sheet marks and wrote down the funds. Different mandate, different methodology, " +
        "you explained to the board. Hold-to-maturity assets valued on a cashflow basis; fund assets " +
        "valued on a fair value basis. Perfectly logical. The FT ran a story noting the discrepancy. " +
        "A PRA supervisor called your General Counsel to 'understand the approach.'",
      conditional_narrative: [
        {
          condition: 'fund_redemption_wave === true',
          snippet: " The fund markdowns triggered redemptions. As SAM sold assets to meet them, " +
            "the prices achieved were below even the marked-down values. " +
            "Investors asked why the balance sheet hadn't marked down in line. " +
            "The PRA asked the same question, less politely.",
        },
        {
          condition: 'pra_ma_scrutiny === true',
          snippet: " The PRA was already watching your matching adjustment portfolio. " +
            "The inconsistency between fund and balance sheet marks gave them fresh ammunition. " +
            "'If the assets are worth less in the fund,' the supervisor asked, " +
            "'why are they worth more on your balance sheet?' It was a good question. " +
            "Your answer was technically correct and regulatorily unconvincing.",
        },
      ],
      compounding_effects: [
        { key: 'private_credit_response', value: 'split_approach' },
        { key: 'balance_sheet_marks_questioned', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'private_credit_opt3',
      label: "Hold all marks — it's a liquidity crisis, not a credit crisis",
      description:
        "The underlying assets are performing. The secondary market is panicking, not pricing. " +
        "Hold marks on both the balance sheet and the funds. Tell investors the fundamentals " +
        "are sound. Risk: if defaults materialise, you look like you were hiding the problem.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: 5,
        reputation: -5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If the writedown severity is actually severe, holding marks looks reckless
        {
          condition: 'writedown_severity > 0.3',
          impact: { solvency_ratio: -8, cumulative_pnl: -15, regulatory_standing: 2, reputation: -10, board_confidence: -8 },
        },
        // Moderate severity — holding was arguably right
        {
          condition: 'writedown_severity <= 0.2',
          impact: { solvency_ratio: 2, cumulative_pnl: 5, reputation: 5, board_confidence: 3 },
        },
        // Large exposure amplifies risk
        {
          condition: 'private_credit_exposure > 0.5',
          impact: { regulatory_standing: 1, board_confidence: -3 },
        },
        // Fund redemption wave — investors are livid they can't get out at fair value
        {
          condition: 'fund_redemption_wave === true',
          impact: { reputation: -10, regulatory_standing: 1, board_confidence: -5, cumulative_pnl: -10 },
        },
        // PRA already watching
        {
          condition: 'pra_ma_scrutiny === true',
          impact: { regulatory_standing: 2, reputation: -5 },
        },
      ],
      narrative_snippet:
        "You held all the marks. 'This is a liquidity event, not a credit event,' you told the board. " +
        "'The cashflows are intact. The secondary market is pricing fear, not fundamentals.' " +
        "The Head of Internal Ratings nodded slowly. 'For now,' she said.",
      conditional_narrative: [
        {
          condition: 'writedown_severity > 0.3',
          snippet: " Three months later, two borrowers missed payments. Then a real estate lending " +
            "position was restructured at sixty cents on the pound. The marks you'd held steady " +
            "now looked like fiction. The PRA requested an urgent meeting. " +
            "The Head of Internal Ratings said nothing. She had said everything she needed to " +
            "say three months ago.",
        },
        {
          condition: 'writedown_severity <= 0.2',
          snippet: " Six months later, the market recovered. The secondary prices crawled back " +
            "towards par. The fundamentals had been sound after all. You looked prescient. " +
            "The Head of Internal Ratings acknowledged that your judgement had been correct, " +
            "which cost her visibly.",
        },
        {
          condition: 'fund_redemption_wave === true',
          snippet: " Fund investors demanded to redeem at the held marks. Your fund managers faced " +
            "an impossible situation: honouring redemptions at stale prices meant the remaining " +
            "investors were being diluted. Three pension schemes complained to the FCA. " +
            "Your Treating Customers Fairly file was about to get thicker.",
        },
      ],
      compounding_effects: [
        { key: 'private_credit_response', value: 'hold_all_marks' },
        { key: 'marks_held_artificially', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
    {
      id: 'private_credit_opt4',
      label: 'Suspend the SAM funds, hold balance sheet marks, wait for clarity',
      description:
        "Gate the funds to prevent fire sales at distressed prices. Protect remaining investors. " +
        "Hold the balance sheet on a cashflow basis. Buys time but reputational damage from " +
        "a fund suspension is immediate and lasting.",
      consequences: {
        solvency_ratio: -1,
        cumulative_pnl: -3,
        board_confidence: -2,
        reputation: -12,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If severity is bad, suspension looks wise in hindsight
        {
          condition: 'writedown_severity > 0.3',
          impact: { reputation: 5, board_confidence: 3, cumulative_pnl: 5 },
        },
        // If severity is low, you suspended for nothing
        {
          condition: 'writedown_severity <= 0.2',
          impact: { reputation: -8, board_confidence: -5 },
        },
        // Large balance sheet exposure — suspension raises questions
        {
          condition: 'private_credit_exposure > 0.5',
          impact: { regulatory_standing: 1 },
        },
        // PRA watching
        {
          condition: 'pra_ma_scrutiny === true',
          impact: { regulatory_standing: 1 },
        },
      ],
      narrative_snippet:
        "You suspended the funds. The announcement went out at 7am. By 9am, " +
        "every financial journalist in London had called your press office. " +
        "'STEADFAST GATES PRIVATE CREDIT FUNDS' was the kindest headline. " +
        "The suspension protected remaining investors from dilution, but the damage to SAM's " +
        "brand was immediate. Two institutional clients pulled mandates from unrelated strategies " +
        "as a precaution.",
      conditional_narrative: [
        {
          condition: 'writedown_severity > 0.3',
          snippet: " When the defaults materialised three months later, the suspension looked prescient. " +
            "Funds that hadn't gated were forced to sell at fire-sale prices. Yours were protected. " +
            "The reputational damage was real but temporary. The financial damage you avoided was permanent.",
        },
        {
          condition: 'writedown_severity <= 0.2',
          snippet: " The market recovered. The suspension had been unnecessary. " +
            "Investors who'd been locked in were furious. Two pension schemes moved their entire " +
            "relationship to a competitor. The Head of Institutional Retirement calculated the lost " +
            "revenue and presented it to the board without comment.",
        },
      ],
      compounding_effects: [
        { key: 'private_credit_response', value: 'suspend_funds' },
        { key: 'sam_funds_suspended', value: true },
        { key: 'sir_pipeline_damaged', value: true },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'private_credit_opt5',
      label: "Opportunistic buying — use the balance sheet to buy distressed assets",
      description:
        "Everyone is selling. You have a balance sheet. Buy performing private credit assets " +
        "at 80p in the pound and hold to maturity. If the cashflows hold, " +
        "it's the trade of the decade. If they don't, you've doubled down on a falling market.",
      consequences: {
        solvency_ratio: -8,
        cumulative_pnl: 5,
        board_confidence: -3,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Low severity = massive win
        {
          condition: 'writedown_severity <= 0.2',
          impact: { solvency_ratio: 8, cumulative_pnl: 35, board_confidence: 10, reputation: 10 },
        },
        // Moderate severity = decent return
        {
          condition: 'writedown_severity > 0.2',
          impact: { cumulative_pnl: 10, board_confidence: 3 },
        },
        // High severity = bought a falling knife
        {
          condition: 'writedown_severity > 0.3',
          impact: { solvency_ratio: -15, cumulative_pnl: -30, board_confidence: -10, regulatory_standing: 1 },
        },
        // Already heavily exposed
        {
          condition: 'private_credit_exposure > 0.5',
          impact: { solvency_ratio: -10, cumulative_pnl: -20, regulatory_standing: 1 },
        },
        // PRA will not like you adding risk
        {
          condition: 'pra_ma_scrutiny === true',
          impact: { regulatory_standing: 1, board_confidence: -3 },
        },
      ],
      narrative_snippet:
        "While everyone was selling, you were buying. Performing loans at 80p. Infrastructure debt " +
        "at 75p. 'If the cashflows hold,' you told the board, 'we've just locked in 300bps of excess spread " +
        "for twenty years.' The CFO looked at you with an expression somewhere between admiration and terror.",
      conditional_narrative: [
        {
          condition: 'writedown_severity <= 0.2',
          snippet: " The cashflows held. Every asset you'd bought at a discount continued paying. " +
            "The excess return over the next five years was extraordinary. The CFO stopped mentioning Sphinx. " +
            "You had out-Sphinxed Sphinx.",
        },
        {
          condition: 'writedown_severity > 0.3',
          snippet: " The cashflows did not hold. You had bought performing loans that subsequently stopped performing. " +
            "The discount you'd paid turned out to be accurate rather than panicked. " +
            "The Head of Internal Ratings made a sound that was technically a cough but functionally an editorial.",
        },
        {
          condition: 'private_credit_exposure > 0.5',
          snippet: " Your existing private credit book was already large from the yield grab. " +
            "Adding more concentrated the position further. The PRA called it " +
            "'a concerning accumulation of illiquid risk.'",
        },
      ],
      compounding_effects: [
        { key: 'private_credit_response', value: 'opportunistic_buying' },
        { key: 'private_credit_exposure_increased', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
  ],
  preconditions: [
    {
      key: 'private_credit_exposure',
      setup_text_modifier:
        "It starts with a mid-tier US private equity firm. They miss a covenant on a £400m infrastructure " +
        "loan. Nobody panics. These things happen.\n\n" +
        "Then a Nordic real estate fund suspends redemptions. Then a UK private debt manager gates three funds. " +
        "Then the FT publishes a long read titled 'The Illiquidity Premium Was The Friends We Made Along The Way' " +
        "and suddenly everyone is paying attention.\n\n" +
        "Secondary market pricing for private credit — what little secondary market exists — drops 20% " +
        "in a fortnight. The fundamentals haven't changed that much: most underlying borrowers are still " +
        "paying, most assets are still performing. But confidence has evaporated and redemption queues " +
        "are growing.\n\n" +
        "You have two problems, and they are connected. And, thanks to the yield grab decision you made " +
        "last year, you are rather more exposed to both of them than you might like.\n\n" +
        "Problem one: Steadfast's balance sheet holds private credit assets — more than it used to, " +
        "after your decision to increase the allocation. You are holding them to maturity. " +
        "The cashflows have not changed. But the question of how you mark them is now politically charged.\n\n" +
        "Problem two: Steadfast Asset Management runs three private credit funds for external clients. " +
        "These funds have a combined AUM of £2.1bn. Investors are asking about valuations. " +
        "Some are asking about redemptions. If SAM marks down and triggers a wave of redemptions, " +
        "does that create a read-across to the balance sheet? If the balance sheet doesn't mark down " +
        "but the funds do, the PRA will want to know why.\n\n" +
        "The Head of Internal Ratings is at your door. She has brought a coffee. This is unprecedented " +
        "and therefore alarming.",
    },
    {
      key: 'yield_grab_goldman_trader',
      option_modifiers: [
        {
          option_id: 'private_credit_opt5',
          consequence_adjustments: { board_confidence: -3, reputation: -5 },
          narrative_override:
            "While everyone was selling, you were buying. The Goldman trader you'd hired was in his element — " +
            "'This is what I was built for,' he said, buying distressed loans with the enthusiasm " +
            "of a man who has never personally experienced a loss. The Head of Internal Ratings " +
            "watched the position sizes grow with an expression that had moved beyond alarm " +
            "into a kind of professional acceptance.",
        },
      ],
    },
  ],
};
