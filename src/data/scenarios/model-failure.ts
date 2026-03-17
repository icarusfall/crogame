import type { Scenario } from '../../types/scenario.js';

export const modelFailure: Scenario = {
  id: 'model_failure',
  title: 'The Friday Afternoon',
  category: 'operational',
  division: 'SIR',
  year_range: [3, 5],
  is_tentpole: false,
  illustration_key: 'scene_actuary_office',
  setup_text:
    "The Chief Actuary knocks on your door at 4:47pm on a Friday. Nobody delivers good news " +
    "at 4:47pm on a Friday.\n\n" +
    "'We have a problem with the longevity model,' she says. She is holding a printout, " +
    "which is how you know it's serious — nobody prints things unless they want physical evidence " +
    "that they raised the alarm.\n\n" +
    "'The mortality improvement factors in the base table are wrong. They've been wrong since " +
    "the model was recalibrated eighteen months ago. Somebody — and I haven't yet established who — " +
    "used the CMI 2019 projections instead of CMI 2022. The difference is material. " +
    "People are living longer than our reserves assume.'\n\n" +
    "She puts the printout on your desk. It shows the reserve impact: somewhere between " +
    "£150m and £250m of additional liabilities that aren't currently on the balance sheet.\n\n" +
    "'The annuity book is understated,' she continues. 'Every bulk annuity deal we've written " +
    "in the last eighteen months has been priced on the wrong mortality basis. The individual " +
    "annuity reserves are affected too. And the Solvency II technical provisions.'\n\n" +
    "She pauses. 'I need to tell you how this happened. The model was recalibrated by a contractor " +
    "who left three months later. The validation was signed off by—' She stops. " +
    "'The validation was signed off.'\n\n" +
    "You both know what she isn't saying. The validation should have caught this. " +
    "Whether it did depends on who was doing the validation, and whether they're still here.",
  random_params: {
    // Actual reserve shortfall
    reserve_shortfall: { type: 'uniform', min: 150, max: 250, unit: 'million' },
    // Whether the PRA independently discovers the issue (e.g., through thematic review)
    pra_discovers_independently: { type: 'bernoulli', probability: 0.25 },
    // Whether auditors flag it in year-end review
    auditor_flags: { type: 'bernoulli', probability: 0.4 },
  },
  options: [
    {
      id: 'model_failure_opt1',
      label: 'Full disclosure — notify PRA, restate reserves, take the hit',
      description:
        "Report to the PRA immediately. Restate reserves. Take the capital hit upfront. " +
        "The solvency ratio will drop significantly. The board will ask how this happened. " +
        "The right answer will not make them feel better.",
      consequences: {
        solvency_ratio: -10,
        cumulative_pnl: -10,
        board_confidence: -3,
        reputation: -3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If PRA was going to find it anyway, early disclosure is rewarded
        {
          condition: 'pra_discovers_independently === true',
          impact: { regulatory_standing: -1, board_confidence: 3 },
        },
        // If Priya was retained, she validates the fix quickly
        {
          condition: 'priya_retained === true',
          impact: { board_confidence: 3, cumulative_pnl: 3 },
        },
        // If model validation was weakened, remediation is harder
        {
          condition: 'model_validation_weakened === true',
          impact: { cumulative_pnl: -5, board_confidence: -3, regulatory_standing: 1 },
        },
        // Systems funded means better audit trail
        {
          condition: 'systems_funded === true',
          impact: { cumulative_pnl: 2, board_confidence: 2 },
        },
      ],
      narrative_snippet:
        "You picked up the phone to the PRA at 5:15pm on a Friday. The supervisor on duty " +
        "took the call with the weary professionalism of someone who had heard worse. " +
        "The reserves were restated. The solvency ratio dropped by {reserve_shortfall} basis points " +
        "overnight. The board held an emergency session on Saturday morning. " +
        "The Chief Actuary presented. Nobody blamed her. She had found it.",
      conditional_narrative: [
        {
          condition: 'priya_retained === true',
          snippet: " Priya led the model remediation. She rebuilt the mortality tables in seventy-two hours, " +
            "cross-validated against three independent sources, and produced documentation that the PRA " +
            "later described as 'exemplary.' The Chief Actuary asked if Priya could be permanently " +
            "seconded to her team. You said no.",
        },
        {
          condition: 'model_validation_weakened === true',
          snippet: " Without the model validation capability you once had, the remediation was slow and uncertain. " +
            "The replacement tables had to be independently verified by an external consultancy " +
            "at a cost of £800,000. The PRA asked why the internal validation function was insufficient. " +
            "The answer involved the words 'headcount reduction.'",
        },
        {
          condition: 'pra_discovers_independently === true',
          snippet: " Three weeks after your disclosure, the PRA's thematic review team independently " +
            "flagged the same issue at two other firms. Your early notification meant you were ahead " +
            "of the curve. The supervisor mentioned this, approvingly, at the next bilateral meeting.",
        },
      ],
      compounding_effects: [
        { key: 'model_failure_response', value: 'full_disclosure' },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'model_failure_opt2',
      label: 'Phase the correction — spread the reserve strengthening over two years',
      description:
        "Reclassify the error as a 'methodology refinement' rather than a model failure. " +
        "Strengthen reserves gradually over the next eight quarters. " +
        "The solvency impact is smoothed. The narrative is managed. " +
        "The PRA might accept this. The auditors might not.",
      consequences: {
        solvency_ratio: -5,
        cumulative_pnl: -8,
        board_confidence: 3,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Auditors flagging it forces immediate recognition
        {
          condition: 'auditor_flags === true',
          impact: { solvency_ratio: -8, cumulative_pnl: -10, board_confidence: -8, regulatory_standing: 1 },
        },
        // PRA discovering it independently while you're phasing = bad
        {
          condition: 'pra_discovers_independently === true',
          impact: { regulatory_standing: 2, reputation: -5, board_confidence: -5 },
        },
        {
          condition: 'systems_funded === true',
          impact: { board_confidence: 2 },
        },
      ],
      narrative_snippet:
        "You called it a 'methodology refinement.' The Chief Actuary looked at you with an expression " +
        "that suggested she had a different word for it. The reserve strengthening was phased across " +
        "eight quarters, each one described in the board papers as 'planned assumption updates consistent " +
        "with evolving longevity evidence.' This was technically accurate in the way that describing " +
        "a house fire as 'an unplanned thermal event' is technically accurate.",
      conditional_narrative: [
        {
          condition: 'auditor_flags === true',
          snippet: " The auditors were not impressed. The lead audit partner asked to see the original " +
            "model calibration documentation. When she compared the CMI 2019 and CMI 2022 tables, " +
            "her expression changed. 'This isn't a methodology refinement,' she said. 'This is an error.' " +
            "The phased approach collapsed. The full reserve hit was taken in a single quarter, " +
            "along with an auditor's management letter that used the phrase 'material weakness in internal controls.'",
        },
        {
          condition: 'pra_discovers_independently === true',
          snippet: " The PRA's thematic review identified the same CMI versioning issue at two other firms. " +
            "They asked Steadfast for its position. Your 'methodology refinement' documentation " +
            "was reviewed alongside the other firms' immediate corrections. The comparison was not favourable.",
        },
      ],
      compounding_effects: [
        { key: 'model_failure_response', value: 'phased_correction' },
        { key: 'model_failure_concealment_risk', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'model_failure_opt3',
      label: 'Challenge the Chief Actuary — commission an independent review first',
      description:
        "Before accepting the £150-250m figure, bring in an external actuarial firm to validate it. " +
        "The Chief Actuary is competent, but this is career-defining money. " +
        "Get a second opinion before triggering a crisis. Buys time but delays action.",
      consequences: {
        solvency_ratio: -3,
        cumulative_pnl: -5,
        board_confidence: 2,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // PRA discovers while you're still reviewing — looks like stalling
        {
          condition: 'pra_discovers_independently === true',
          impact: { regulatory_standing: 1, board_confidence: -5, reputation: -3 },
        },
        // Auditors flag it during the review period
        {
          condition: 'auditor_flags === true',
          impact: { board_confidence: -3, cumulative_pnl: -3 },
        },
        {
          condition: 'priya_retained === true',
          impact: { board_confidence: 2, cumulative_pnl: 2 },
        },
      ],
      narrative_snippet:
        "You commissioned Towers Watson to conduct an independent review. The Chief Actuary " +
        "understood the logic but not the implication. 'You think I'm wrong?' she asked. " +
        "'I think this is too important to rely on one view,' you replied. " +
        "She accepted this with the grace of someone who knew she was right and could afford to wait.",
      conditional_narrative: [
        {
          condition: 'pra_discovers_independently === true',
          snippet: " Towers Watson confirmed the Chief Actuary's estimate — the shortfall was £{reserve_shortfall}m. " +
            "Unfortunately, the PRA had already identified the issue through their thematic review. " +
            "The six-week delay between internal discovery and regulatory notification " +
            "was noted in the supervisory assessment. 'Due diligence' and 'delay' look very similar " +
            "when viewed from the regulator's perspective.",
        },
        {
          condition: 'pra_discovers_independently !== true',
          snippet: " Towers Watson's report came back in six weeks. The shortfall was £{reserve_shortfall}m " +
            "— exactly where the Chief Actuary had said it would be. She did not say 'I told you so.' " +
            "She did not need to. The report gave you the credibility to present to the board " +
            "with two independent confirmations. The remediation plan was approved unanimously.",
        },
      ],
      compounding_effects: [
        { key: 'model_failure_response', value: 'independent_review' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'model_failure_opt4',
      label: 'Fix quietly — correct the model, absorb the impact through assumption changes',
      description:
        "Correct the CMI tables. Adjust other assumptions — expense loadings, lapse rates, " +
        "investment returns — to partially offset the mortality impact. " +
        "The net reserve increase is real but smaller. The PRA doesn't need to know " +
        "about an internal model correction. Unless someone tells them.",
      consequences: {
        solvency_ratio: -4,
        cumulative_pnl: -3,
        board_confidence: 0,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Auditors will see through offsetting assumption changes
        {
          condition: 'auditor_flags === true',
          impact: { regulatory_standing: 2, board_confidence: -15, reputation: -8, cumulative_pnl: -10 },
        },
        // PRA finding it means you actively concealed
        {
          condition: 'pra_discovers_independently === true',
          impact: { regulatory_standing: 2, board_confidence: -12, reputation: -10 },
        },
        // Without Priya, the offsetting assumptions are poorly calibrated
        {
          condition: 'model_validation_weakened === true',
          impact: { solvency_ratio: -3, cumulative_pnl: -5 },
        },
      ],
      narrative_snippet:
        "You corrected the CMI tables and adjusted three other assumptions to soften the blow. " +
        "The net reserve increase was £{reserve_shortfall}m in reality but appeared as £40m " +
        "in the board papers, attributed to 'updated demographic assumptions.' " +
        "The Chief Actuary signed the revised basis under protest. She documented her objections " +
        "in an email to you, CC'd to nobody, but saved in a folder called 'Insurance.'",
      conditional_narrative: [
        {
          condition: 'auditor_flags === true',
          snippet: " The auditors identified the offsetting assumption changes during their year-end review. " +
            "The lead partner requested a meeting with the Chair of the Audit Committee — without management present. " +
            "This is the meeting you never want to happen. " +
            "The assumption changes were reversed. The full reserve hit was recognised. " +
            "The Chief Actuary's email was produced. It was devastating.",
        },
        {
          condition: 'pra_discovers_independently === true',
          snippet: " The PRA's thematic review included a deep dive into assumption-setting processes. " +
            "The simultaneous change to mortality, expenses, lapses, and investment returns " +
            "was flagged as 'unusual and insufficiently justified.' A section 166 skilled person review " +
            "was commissioned. The skilled person found the Chief Actuary's email within the first week.",
        },
      ],
      compounding_effects: [
        { key: 'model_failure_response', value: 'quiet_fix' },
        { key: 'model_failure_concealment_risk', value: true },
        { key: 'assumptions_manipulated', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
    {
      id: 'model_failure_opt5',
      label: 'Escalate to the CEO — make it her problem',
      description:
        "This is too big for you to own alone. Take it to Caroline immediately. " +
        "Let her decide the approach. Shares the burden but also shares the control. " +
        "Caroline may choose an approach you wouldn't.",
      consequences: {
        solvency_ratio: -8,
        cumulative_pnl: -5,
        board_confidence: -2,
        reputation: 2,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'ceo_relationship_strained === true',
          impact: { board_confidence: -5, reputation: -3 },
        },
        {
          condition: 'ceo_relationship_strained !== true',
          impact: { board_confidence: 3 },
        },
        {
          condition: 'pra_discovers_independently === true',
          impact: { regulatory_standing: -1, board_confidence: 2 },
        },
        {
          condition: 'priya_retained === true',
          impact: { cumulative_pnl: 3 },
        },
      ],
      narrative_snippet:
        "You took it to Caroline at 5:30pm. She listened for four minutes without interrupting, " +
        "which is a personal record. 'How bad?' she asked. '£{reserve_shortfall} million,' you said. " +
        "She was silent for six seconds. Then: 'We disclose. Monday morning. Full board, PRA, auditors. " +
        "I'm not having this come out any other way.' She picked up her phone. " +
        "'Cancel my dinner,' she told her PA. She looked at you. 'Yours too.'",
      conditional_narrative: [
        {
          condition: 'ceo_relationship_strained === true',
          snippet: " Caroline's response was professional but pointed. 'I notice these things always arrive " +
            "on my desk fully formed,' she said. 'I'd prefer to be in the loop before they become crises.' " +
            "The implication was clear: you had escalated the problem but not the early warning signs. " +
            "She handled it well. She did not thank you for bringing it to her.",
        },
        {
          condition: 'ceo_relationship_strained !== true',
          snippet: " Caroline handled it like the crisis it was. The disclosure was clean, the board was briefed, " +
            "and the PRA was notified before the market opened on Monday. " +
            "'This is what governance looks like,' she told the board. 'It's not pretty, but it's honest.' " +
            "She gave you a nod across the boardroom table. It was worth more than most bonuses.",
        },
      ],
      compounding_effects: [
        { key: 'model_failure_response', value: 'escalated_to_ceo' },
      ],
      strategy_alignment: 'balanced',
    },
  ],
  preconditions: [
    {
      key: 'systems_funded',
      option_modifiers: [
        {
          option_id: 'model_failure_opt1',
          consequence_adjustments: { cumulative_pnl: 3 },
          narrative_override:
            "You picked up the phone to the PRA at 5:15pm on a Friday. The modern platform flagged " +
            "exactly which downstream calculations were affected — every policy, every reserve line, " +
            "every regulatory return. The remediation that would have taken weeks on the old systems " +
            "took four days. Duncan's infrastructure team had the audit trail ready before the PRA asked for it.",
        },
      ],
    },
    {
      key: 'priya_retained',
      option_modifiers: [
        {
          option_id: 'model_failure_opt3',
          consequence_adjustments: { cumulative_pnl: 2, board_confidence: 2 },
          narrative_override:
            "You commissioned Towers Watson, but Priya had already started her own parallel review. " +
            "When the external report arrived six weeks later, Priya's analysis was on your desk — " +
            "more detailed, more precise, and produced at a fraction of the cost. " +
            "The Chief Actuary asked, again, if Priya could be permanently seconded to her team.",
        },
      ],
    },
    {
      key: 'model_validation_weakened',
      option_modifiers: [
        {
          option_id: 'model_failure_opt1',
          consequence_adjustments: { cumulative_pnl: -3, regulatory_standing: 1 },
          narrative_override:
            "You disclosed immediately, but without the model validation capability you'd lost " +
            "in the headcount reduction, the remediation was painful. The contractor who'd made the original error " +
            "was long gone. The person who would have caught it was at a competitor. " +
            "External consultants were engaged at emergency rates. The PRA noted that the firm's " +
            "model validation function appeared 'under-resourced for the complexity of the business.'",
        },
      ],
    },
  ],
};
