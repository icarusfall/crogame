import type { Scenario } from '../../types/scenario.js';

export const fourPercentRound1: Scenario = {
  id: 'four_percent_r1',
  title: 'The Four Percent Problem',
  category: 'operational',
  division: 'SW',
  year_range: [2, 3],
  is_tentpole: true,
  illustration_key: 'four_percent',
  setup_text:
    "A consultant from Mercer has emailed your Head of Retail Operations. Politely but firmly, " +
    "she's pointing out that the unit allocation on a large DC scheme doesn't match her own calculations.\n\n" +
    "Your ops team investigates and discovers that someone — nobody knows who, nobody knows when — " +
    "hard-coded a 4% income accrual rate as a fallback for when actual distribution figures aren't available " +
    "from the fund managers. For a handful of funds, it's been firing for... a while.\n\n" +
    "'It's not just that policy,' says the analyst. 'It's not just that scheme.'\n\n" +
    "The next fund distribution is tomorrow morning.",
  random_params: {
    manual_override_success: { type: 'bernoulli', probability: 0.7 },
  },
  options: [
    {
      id: 'four_pct_r1_opt1',
      label: "Cancel tomorrow's distribution",
      description:
        "Stops the bleeding but fires a flare. Consultants and the FCA will notice " +
        "a cancelled distribution immediately.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -2,
        board_confidence: -2,
        reputation: -8,
        regulatory_standing: 1,
      },
      narrative_snippet:
        "You cancelled the distribution. Every consultant on every affected scheme got an email. " +
        "By lunchtime, two had called the FCA. Your Head of Ops looked like he hadn't slept. He hadn't.",
      compounding_effects: [
        { key: 'four_pct_r1_choice', value: 'cancel_distribution' },
        { key: 'four_pct_fca_aware', value: true },
        { key: 'four_pct_bleeding_stopped', value: true },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'four_pct_r1_opt2',
      label: 'Let the distribution run, plan to back out later',
      description:
        "Buys time to understand the full scope. But you've knowingly let a wrong distribution " +
        "go through, which the FCA will take a dim view of.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: 0,
        reputation: 0,
        regulatory_standing: 0,
      },
      narrative_snippet:
        "You let the distribution run. The Mercer consultant got her answer — and it was still wrong. " +
        "You told yourself you needed time to understand the problem. The FCA would later describe this as " +
        "'a decision to knowingly process incorrect transactions.'",
      conditional_consequences: [
        // The FCA will be much harsher in later rounds
        {
          condition: 'four_pct_fca_aware === true',
          impact: { regulatory_standing: 2, board_confidence: -5 },
        },
      ],
      compounding_effects: [
        { key: 'four_pct_r1_choice', value: 'let_it_run' },
        { key: 'four_pct_knowingly_processed', value: true },
        { key: 'four_pct_bleeding_stopped', value: false },
      ],
      strategy_alignment: 'aggressive',
    },
    {
      id: 'four_pct_r1_opt3',
      label: 'Manual override on affected funds only',
      description:
        "Surgical fix on the funds you know about. 70% chance it works cleanly. " +
        "30% chance you create a second error.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -1,
        board_confidence: 1,
        reputation: 0,
        regulatory_standing: 0,
      },
      // The random outcome is resolved at decision time
      conditional_consequences: [
        {
          condition: 'manual_override_success === false',
          impact: {
            cumulative_pnl: -3,
            reputation: -5,
            regulatory_standing: 1,
            board_confidence: -3,
          },
        },
      ],
      narrative_snippet:
        "You ordered a manual override on the affected funds. Your best analyst stayed until 3am.",
      conditional_narrative: [
        {
          condition: 'manual_override_success === true',
          snippet: " It worked. The distribution went out clean. Nobody outside the building knew. " +
            "For now.",
        },
        {
          condition: 'manual_override_success === false',
          snippet: " It didn't work. The override introduced a second error — a rounding issue " +
            "that affected a different set of policies. Your analyst cried in the bathroom. " +
            "The Mercer consultant emailed again, more firmly this time.",
        },
      ],
      compounding_effects: [
        { key: 'four_pct_r1_choice', value: 'manual_override' },
        { key: 'four_pct_bleeding_stopped', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'four_pct_r1_opt4',
      label: 'Cancel distribution AND proactively call the FCA',
      description:
        "The textbook right answer. But it commits you to a timeline and creates an open regulatory " +
        "case before you understand the full scope of the problem.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -3,
        board_confidence: -4,
        reputation: -5,
        regulatory_standing: 1,
      },
      narrative_snippet:
        "You cancelled the distribution and called the FCA before they called you. " +
        "The regulator was impressed by the proactivity. The board was less impressed by the headlines. " +
        "'Steadfast Reports Processing Error' isn't the kind of coverage the CEO had in mind.",
      compounding_effects: [
        { key: 'four_pct_r1_choice', value: 'cancel_and_disclose' },
        { key: 'four_pct_fca_aware', value: true },
        { key: 'four_pct_proactive_disclosure', value: true },
        { key: 'four_pct_bleeding_stopped', value: true },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'four_pct_r1_opt5',
      label: "Fix only the Mercer consultant's scheme, treat as isolated",
      description:
        "Works for about three weeks. Then another consultant finds the same issue. " +
        "Then you're in a much worse position with lost credibility.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: 2,
        reputation: 0,
        regulatory_standing: 0,
      },
      narrative_snippet:
        "You fixed the Mercer scheme and called it an isolated incident. It wasn't. " +
        "Three weeks later, a Barnett Waddingham consultant found the same problem on two more schemes. " +
        "When you explained that you'd known about the underlying issue, " +
        "the room went very quiet indeed.",
      compounding_effects: [
        { key: 'four_pct_r1_choice', value: 'treat_as_isolated' },
        { key: 'four_pct_credibility_lost', value: true },
        { key: 'four_pct_bleeding_stopped', value: false },
      ],
      strategy_alignment: 'aggressive',
    },
  ],
  preconditions: [
    {
      key: 'systems_funded',
      option_modifiers: [
        {
          option_id: 'four_pct_r1_opt3',
          consequence_adjustments: { board_confidence: 2 },
          narrative_override:
            "You ordered a manual override on the affected funds. The upgraded systems meant your team " +
            "could identify all affected funds quickly and the override was cleaner than it would have been " +
            "on the legacy platform.",
        },
      ],
    },
  ],
  is_multi_round: true,
  round: 1,
  follow_up_scenario_id: 'four_percent_r2',
  follow_up_condition: 'four_pct_r1_choice', // always fires — the problem doesn't go away
};

export const fourPercentRound2: Scenario = {
  id: 'four_percent_r2',
  title: 'The Four Percent Problem — Remediation',
  category: 'operational',
  division: 'SW',
  year_range: [3, 4],
  is_tentpole: false,
  illustration_key: 'four_percent',
  setup_text:
    "The reconciliation reveals the true scale: {total_misallocation} across " +
    "{policies_affected} policies. Some customers have been overpaid, some underpaid. " +
    "The board wants a remediation plan. The FCA is watching. The press haven't found out yet.",
  random_params: {
    total_misallocation: { type: 'uniform', min: 8, max: 30, unit: 'million' },
    policies_affected: { type: 'uniform', min: 40000, max: 150000, unit: 'policies' },
  },
  options: [
    {
      id: 'four_pct_r2_opt1',
      label: 'Full remediation with clawback from overpaid clients',
      description:
        "Mathematically clean. But demanding money back from pensioners generates terrible headlines.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -5,
        board_confidence: 2,
        reputation: -15,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'total_misallocation > 20',
          impact: { cumulative_pnl: -10, reputation: -5 },
        },
        {
          condition: 'four_pct_proactive_disclosure === true',
          impact: { regulatory_standing: -1, reputation: 3 },
        },
      ],
      narrative_snippet:
        "You ordered full remediation including clawbacks. The maths was clean. " +
        "The Daily Mail headline — 'Insurance Giant Demands Money Back From Pensioners' — was not.",
      compounding_effects: [
        { key: 'four_pct_r2_choice', value: 'full_clawback' },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'four_pct_r2_opt2',
      label: "Top up losers, don't claw back overpaid",
      description:
        "Firm eats the full cost. Board asks why shareholders are paying for an operational error.",
      consequences: {
        solvency_ratio: -3,
        cumulative_pnl: -15,
        board_confidence: -3,
        reputation: 5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'total_misallocation > 20',
          impact: { cumulative_pnl: -15, solvency_ratio: -3, board_confidence: -3 },
        },
        {
          condition: 'four_pct_proactive_disclosure === true',
          impact: { reputation: 5 },
        },
      ],
      narrative_snippet:
        "You topped up everyone who'd lost out and let the overpayments go. " +
        "The CFO calculated the cost and went for a long walk. " +
        "'We're paying for someone else's spreadsheet error,' he said. He wasn't wrong.",
      compounding_effects: [
        { key: 'four_pct_r2_choice', value: 'no_clawback' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'four_pct_r2_opt3',
      label: 'Top up losers, claw back only above de minimis (£500)',
      description:
        "Pragmatic middle ground. Most small overpayments ignored, only large ones recovered.",
      consequences: {
        solvency_ratio: -1,
        cumulative_pnl: -8,
        board_confidence: 1,
        reputation: -3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'total_misallocation > 20',
          impact: { cumulative_pnl: -8 },
        },
        {
          condition: 'four_pct_proactive_disclosure === true',
          impact: { regulatory_standing: -1 },
        },
      ],
      narrative_snippet:
        "You set a de minimis threshold at £500. Below that, Steadfast absorbed the cost. " +
        "Above it, polite but firm letters went out. The FCA called it 'a reasonable approach.' " +
        "The CFO called it 'the least worst option.' The Head of Ops just looked tired.",
      compounding_effects: [
        { key: 'four_pct_r2_choice', value: 'de_minimis' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'four_pct_r2_opt4',
      label: 'Set de minimis on BOTH top-ups and clawbacks',
      description:
        "Saves cost by not correcting small underpayments either. " +
        "The FCA will take a dim view — you're choosing not to make some customers whole.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -3,
        board_confidence: 3,
        reputation: -5,
        regulatory_standing: 1,
      },
      conditional_consequences: [
        {
          condition: 'four_pct_proactive_disclosure === true',
          impact: { board_confidence: -2 }, // undermines the goodwill from early disclosure
        },
        {
          condition: 'four_pct_credibility_lost === true',
          impact: { regulatory_standing: 1, reputation: -5 },
        },
      ],
      narrative_snippet:
        "You applied a de minimis threshold in both directions — some customers who'd been underpaid " +
        "would stay underpaid. The CFO approved the cost saving. The FCA did not approve the principle. " +
        "'Treating Customers Fairly,' the regulator reminded you, 'is not optional below £500.'",
      compounding_effects: [
        { key: 'four_pct_r2_choice', value: 'double_de_minimis' },
        { key: 'four_pct_fca_displeased', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
    {
      id: 'four_pct_r2_opt5',
      label: 'Commission independent Big Four review before deciding',
      description:
        "Thorough but costs £2m and takes 8 weeks. During which complaints escalate.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -2,
        board_confidence: -2,
        reputation: -8,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'four_pct_credibility_lost === true',
          impact: { reputation: -5, board_confidence: -3 },
        },
      ],
      narrative_snippet:
        "You commissioned Deloitte to conduct an independent review. Professional, thorough, expensive, " +
        "and slow. During the eight weeks it took, 340 customer complaints arrived. " +
        "The FCA asked why remediation was being delayed for a consulting engagement.",
      compounding_effects: [
        { key: 'four_pct_r2_choice', value: 'big_four_review' },
        { key: 'four_pct_delayed_remediation', value: true },
      ],
      strategy_alignment: 'conservative',
    },
  ],
  preconditions: [
    {
      key: 'four_pct_knowingly_processed',
      option_modifiers: [
        {
          option_id: 'four_pct_r2_opt1',
          consequence_adjustments: { regulatory_standing: 1 },
        },
        {
          option_id: 'four_pct_r2_opt2',
          consequence_adjustments: { regulatory_standing: 1 },
        },
      ],
    },
    {
      key: 'four_pct_credibility_lost',
      option_modifiers: [
        {
          option_id: 'four_pct_r2_opt1',
          consequence_adjustments: { reputation: -5, regulatory_standing: 1 },
        },
      ],
    },
  ],
  is_multi_round: true,
  round: 2,
  follow_up_scenario_id: 'four_percent_r3',
  follow_up_condition: 'four_pct_r2_choice', // always fires
};

export const fourPercentRound3: Scenario = {
  id: 'four_percent_r3',
  title: 'The Four Percent Problem — The Second Error',
  category: 'operational',
  division: 'SW',
  year_range: [4, 5],
  is_tentpole: false,
  illustration_key: 'four_percent',
  setup_text:
    "Your Head of Operations has just walked into your office and closed the door.\n\n" +
    "'There was a bug in the reconciliation spreadsheet. Some of the correction amounts were wrong. " +
    "About 15,000 policies.'\n\n" +
    "He sits down without being invited.\n\n" +
    "'I'm very sorry.'",
  random_params: {},
  options: [
    {
      id: 'four_pct_r3_opt1',
      label: 'Full re-remediation with system-based recalculation',
      description:
        "Do it properly this time. Use the actual systems, not spreadsheets. " +
        "Expensive but clean.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -5,
        board_confidence: -3,
        reputation: -5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'systems_funded === true',
          impact: { cumulative_pnl: 2, board_confidence: 2 },
        },
        {
          condition: 'four_pct_fca_displeased === true',
          impact: { regulatory_standing: 1 },
        },
        {
          condition: 'four_pct_proactive_disclosure === true',
          impact: { regulatory_standing: -1 },
        },
      ],
      narrative_snippet:
        "You ordered a full system-based recalculation. No more spreadsheets. No more manual overrides. " +
        "The cost was significant. The board's patience was wearing thin. " +
        "But the numbers were finally, provably, correct.",
      compounding_effects: [
        { key: 'four_pct_r3_choice', value: 'full_re_remediation' },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'four_pct_r3_opt2',
      label: 'Re-correct only where second error exceeds materiality threshold',
      description:
        "Only fix cases where the second error is material. Faster and cheaper, " +
        "but some customers remain slightly wrong.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -2,
        board_confidence: 0,
        reputation: -3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'four_pct_fca_displeased === true',
          impact: { regulatory_standing: 1, reputation: -3 },
        },
        {
          condition: 'four_pct_proactive_disclosure === true',
          impact: { board_confidence: 1 },
        },
      ],
      narrative_snippet:
        "You set a materiality threshold and re-corrected only the significant errors. " +
        "Pragmatic. Defensible. The Head of Ops looked relieved. " +
        "The FCA looked... less relieved.",
      compounding_effects: [
        { key: 'four_pct_r3_choice', value: 'materiality_threshold' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'four_pct_r3_opt3',
      label: 'Quietly absorb the differences and close the file',
      description:
        "The differences are small enough to bury. But if the FCA reviews the file " +
        "and finds discrepancies...",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: 3,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If FCA is already watching, high chance they find it
        {
          condition: 'four_pct_fca_aware === true',
          impact: { regulatory_standing: 2, reputation: -10, board_confidence: -8 },
        },
        {
          condition: 'four_pct_fca_displeased === true',
          impact: { regulatory_standing: 1, reputation: -5 },
        },
        // If you proactively disclosed earlier and now hide this, it's particularly bad
        {
          condition: 'four_pct_proactive_disclosure === true',
          impact: { regulatory_standing: 1, board_confidence: -5 },
        },
      ],
      narrative_snippet:
        "You absorbed the differences and closed the file. The Head of Ops looked grateful. " +
        "The numbers were close enough. Probably.",
      conditional_narrative: [
        {
          condition: 'four_pct_fca_aware === true',
          snippet: " The FCA's thematic review, six months later, found the discrepancies. " +
            "'Close enough' turned out not to be a recognised regulatory standard.",
        },
      ],
      compounding_effects: [
        { key: 'four_pct_r3_choice', value: 'absorb_and_close' },
        { key: 'four_pct_hidden_discrepancies', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
  ],
  preconditions: [
    {
      key: 'four_pct_delayed_remediation',
      option_modifiers: [
        {
          option_id: 'four_pct_r3_opt1',
          consequence_adjustments: { board_confidence: -3, regulatory_standing: 1 },
        },
      ],
    },
  ],
  is_multi_round: true,
  round: 3,
};
