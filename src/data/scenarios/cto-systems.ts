import type { Scenario } from '../../types/scenario.js';

export const ctoSystems: Scenario = {
  id: 'cto_systems',
  title: "The CTO's Grand Plan",
  category: 'operational',
  division: 'group',
  year_range: [1, 2],
  is_tentpole: true,
  illustration_key: 'scene_boardroom',
  setup_text:
    "The new CTO has been in the building for six weeks. He has spent most of that time in the server room, " +
    "emerging periodically to shake his head and request meetings with people who would rather not have them.\n\n" +
    "Today he has assembled the executive committee for what he calls a 'technology estate review.' " +
    "He has forty-seven slides. The first one says 'BURNING PLATFORM' in red letters.\n\n" +
    "'The core valuation engine,' he begins, 'was built in 2009 by a man called Derek. Derek left in 2014. " +
    "Nobody has touched the underlying logic since then because nobody understands it. The documentation is a " +
    "Word file on a shared drive called DEREK_NOTES_FINAL_v3_REAL_FINAL.docx. I have read it. " +
    "It references another document that does not exist.'\n\n" +
    "He pauses for effect. Several people look at their phones.\n\n" +
    "'The risk reporting suite runs on a different technology stack to the client servicing platform, " +
    "which runs on a different stack to the actuarial models, which communicate with each other via a " +
    "series of spreadsheets that are manually copied every Tuesday and Thursday by a woman called Janet. " +
    "Janet is fifty-seven years old and is, by her own account, the only person who knows which spreadsheets " +
    "go where. She has mentioned retirement.'\n\n" +
    "He advances to slide two. It also says 'BURNING PLATFORM' but this time in larger letters.\n\n" +
    "'I am proposing a full platform rebuild. One integrated system. Modern architecture. Twelve months. " +
    "Forty million pounds.' He says this last part the way one might mention a parking fine.\n\n" +
    "The CFO makes a noise. The CEO looks at you.\n\n" +
    "You are aware, from painful experience elsewhere, that IT transformation projects have a habit of " +
    "costing rather more than the initial estimate. The CTO was hired three months ago from a consulting firm. " +
    "He is running the classic playbook: arrive, declare everything broken, demand a blank cheque. " +
    "The question is whether, this time, everything actually is broken.",
  random_params: {
    // How much over budget the project goes (if funded)
    overrun_factor: { type: 'uniform', min: 1.5, max: 2.8, unit: 'multiplier' },
  },
  options: [
    {
      id: 'cto_systems_opt1',
      label: 'Fund it in full — £40m, twelve months, get it done',
      description:
        "Approve the full programme. The CTO gets his blank cheque. " +
        "The CFO will hate this. The board will ask hard questions about ROI. " +
        "Historic IT projects at the firm suggest the final bill will be higher.",
      consequences: {
        solvency_ratio: -5,
        cumulative_pnl: -25,
        board_confidence: -8,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // The overrun hits in later scenarios via compounding, not here
      ],
      narrative_snippet:
        "You approved the full £40m. The CFO looked at you as if you'd suggested setting fire to the lobby. " +
        "'Forty million,' he repeated, as if hearing it again might change the number. " +
        "The CTO shook your hand with the enthusiasm of a man who has just been handed someone else's money. " +
        "The board asked for quarterly updates. The CEO said she trusted your judgement, " +
        "which is what CEOs say when they want to be able to blame you later.",
      compounding_effects: [
        { key: 'systems_funded', value: true },
        { key: 'systems_funding_level', value: 1.0 },
        { key: 'systems_started', value: true },
        { key: 'systems_budget', value: 40 },
      ],
      strategy_alignment: 'growth',
    },
    {
      id: 'cto_systems_opt2',
      label: 'Fund phase one only — £15m for the risk platform, review after',
      description:
        "Approve the risk reporting rebuild only. Defer the valuation engine and client servicing. " +
        "Pragmatic, but the CTO warns that a phased approach will cost more in total " +
        "and leave you running two systems in parallel.",
      consequences: {
        solvency_ratio: -2,
        cumulative_pnl: -15,
        board_confidence: -2,
        reputation: 0,
        regulatory_standing: 0,
      },
      narrative_snippet:
        "You funded phase one: the risk platform rebuild, £15m. The CTO argued that phasing would cost more " +
        "in the long run. 'You can't renovate half a house while living in the other half,' he said. " +
        "'Watch me,' you replied. He went away to produce a revised plan. " +
        "The CFO looked relieved. Janet continued copying spreadsheets.",
      compounding_effects: [
        { key: 'systems_funded', value: true },
        { key: 'systems_funding_level', value: 0.5 },
        { key: 'systems_started', value: true },
        { key: 'systems_phased', value: true },
        { key: 'systems_budget', value: 15 },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'cto_systems_opt3',
      label: 'Approve £5m for tactical fixes and a proper scoping study',
      description:
        "Patch the worst problems now. Commission an independent review of the CTO's proposal " +
        "before committing to a full rebuild. Sensible governance, but the tactical fixes " +
        "add complexity to an already fragile estate.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -5,
        board_confidence: 2,
        reputation: 0,
        regulatory_standing: 0,
      },
      narrative_snippet:
        "You approved £5m for tactical fixes and a scoping study. 'So we're commissioning a study " +
        "to study whether to do the thing I've already told you we need to do,' said the CTO. " +
        "'Yes,' you said. 'That is how large organisations work.' " +
        "Deloitte were engaged. They would take sixteen weeks to confirm everything the CTO had said, " +
        "at a cost of £1.2m, presented in a font you didn't recognise.",
      compounding_effects: [
        { key: 'systems_funded', value: false },
        { key: 'systems_funding_level', value: 0.1 },
        { key: 'systems_started', value: false },
        { key: 'systems_tactical_fixes', value: true },
        { key: 'systems_budget', value: 5 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'cto_systems_opt4',
      label: "Defer — the current systems work, and we have bigger priorities",
      description:
        "Thank the CTO for his thoroughness. Explain that the firm has managed with these systems " +
        "for fifteen years and they can manage a bit longer. Focus the budget on growth initiatives.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: 5,
        reputation: 0,
        regulatory_standing: 0,
      },
      narrative_snippet:
        "You thanked the CTO for his analysis and explained that now was not the time. " +
        "He stared at you for a long moment. 'I'll put that in writing,' he said, 'so that when something goes wrong, " +
        "and it will, there is a clear record of who was told what and when.' " +
        "The CFO nodded approvingly. The CEO looked relieved. Janet made a note in her spreadsheet. " +
        "Derek's documentation remained unread.",
      compounding_effects: [
        { key: 'systems_funded', value: false },
        { key: 'systems_funding_level', value: 0 },
        { key: 'systems_started', value: false },
        { key: 'cto_warned_in_writing', value: true },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'cto_systems_opt5',
      label: "Fund it, but cap the budget — £25m, and the CTO owns the overrun risk",
      description:
        "Approve the rebuild but at a reduced budget with a hard cap. The CTO must descope to fit. " +
        "He'll have to cut corners. Some of the integration work won't get done.",
      consequences: {
        solvency_ratio: -3,
        cumulative_pnl: -15,
        board_confidence: 0,
        reputation: 0,
        regulatory_standing: 0,
      },
      narrative_snippet:
        "You approved £25m with a hard cap. The CTO's face did something complicated. " +
        "'Twenty-five million for a forty million programme,' he said. " +
        "'Then it's a twenty-five million programme,' you replied. " +
        "'It's a forty million programme done badly for twenty-five million,' he corrected. " +
        "He was not wrong, but he was also not in charge. He went away to descope. " +
        "The integration layer between risk and actuarial was the first thing cut. " +
        "This would matter later. Everything always matters later.",
      compounding_effects: [
        { key: 'systems_funded', value: true },
        { key: 'systems_funding_level', value: 0.6 },
        { key: 'systems_started', value: true },
        { key: 'systems_capped', value: true },
        { key: 'systems_budget', value: 25 },
        { key: 'systems_integration_cut', value: true },
      ],
      strategy_alignment: 'balanced',
    },
  ],
  preconditions: [],
};
