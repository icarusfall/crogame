import type { Scenario } from '../../types/scenario.js';

export const regulatorReview: Scenario = {
  id: 'regulator_review',
  title: "The Regulator's Thematic Review",
  category: 'curveball',
  division: 'group',
  year_range: [4, 5],
  is_tentpole: true,
  illustration_key: 'scene_pra_office',
  setup_text:
    "The letter arrives on a Tuesday morning, which is when bad news always arrives. " +
    "It is from the Prudential Regulation Authority. It is polite in the way that letters " +
    "from regulators are polite, which is to say it is not polite at all.\n\n" +
    "'Dear Chief Risk Officer,' it begins. 'As part of our ongoing thematic review of " +
    "risk management practices in the life insurance sector, we are writing to inform you " +
    "that Steadfast Group has been selected for a deep-dive supervisory assessment.'\n\n" +
    "Selected. As if it were a prize.\n\n" +
    "The review will cover governance, risk appetite, asset quality, operational resilience, " +
    "and conduct. A team of six will arrive in three weeks. They will want access to everything. " +
    "Board minutes. Risk committee papers. Internal audit reports. Model validation records. " +
    "The CTO's slide deck. Janet's spreadsheets. Derek's documentation, such as it is.\n\n" +
    "You have three weeks to prepare. The question is not whether they will find something. " +
    "The question is how much you tell them before they find it themselves.\n\n" +
    "Your General Counsel has cleared her afternoon.",
  random_params: {
    // How thorough the review team is — affects whether hidden issues are found
    review_thoroughness: {
      type: 'discrete',
      outcomes: [
        { value: 'routine', weight: 2 },      // ~40% — standard review, may miss things
        { value: 'thorough', weight: 2 },      // ~40% — competent, finds most issues
        { value: 'forensic', weight: 1 },       // ~20% — ex-industry expert, finds everything
      ],
    },
  },
  options: [
    {
      id: 'regulator_review_opt1',
      label: 'Full transparency — open the books, volunteer everything',
      description:
        "Give the PRA team unrestricted access. Proactively disclose every issue you know about, " +
        "including things they might not find on their own. Accept the consequences. " +
        "The fine may be large, but cooperation credit is real.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -5,
        board_confidence: -5,
        reputation: -8,
        regulatory_standing: 1,
      },
      conditional_consequences: [
        // If you've been clean, full transparency is almost painless
        {
          condition: 'conservative_choices_count >= 4',
          impact: { regulatory_standing: -2, reputation: 5, board_confidence: 3 },
        },
        // Four percent problem — proactive disclosure gets credit
        {
          condition: 'four_pct_proactive_disclosure === true',
          impact: { regulatory_standing: -1, reputation: 3 },
        },
        // But if you knowingly processed bad transactions, disclosing that is painful
        {
          condition: 'four_pct_knowingly_processed === true',
          impact: { regulatory_standing: 1, cumulative_pnl: -10, reputation: -5 },
        },
        // Hidden discrepancies from round 3 — volunteering this is costly but gets credit
        {
          condition: 'four_pct_hidden_discrepancies === true',
          impact: { regulatory_standing: 1, cumulative_pnl: -8, reputation: -5, board_confidence: -3 },
        },
        // PRA MA scrutiny from aggressive bulk annuity
        {
          condition: 'pra_ma_scrutiny === true',
          impact: { regulatory_standing: 1, cumulative_pnl: -5 },
        },
        // Leverage — disclosing concentration risk
        {
          condition: 'yield_grab_leverage === true',
          impact: { regulatory_standing: 1, board_confidence: -3 },
        },
        // If you funded systems, you get credit for operational investment
        {
          condition: 'systems_funded === true',
          impact: { regulatory_standing: -1, reputation: 2 },
        },
        // Quiet position reduction during gilt crisis
        {
          condition: 'quiet_reduction_leak_risk === true',
          impact: { regulatory_standing: 1, reputation: -5 },
        },
        // CTO warned in writing and you ignored it
        {
          condition: 'cto_warned_in_writing === true',
          impact: { board_confidence: -3, regulatory_standing: 1 },
        },
        // Formal memo from Head of Internal Ratings
        {
          condition: 'formal_memo_filed === true',
          impact: { regulatory_standing: 1 },
        },
      ],
      narrative_snippet:
        "You opened the books. Everything. Every memo, every board minute, every decision you'd made " +
        "and every decision you'd avoided. Your General Counsel watched the PRA team work through " +
        "five years of your tenure with the expression of someone watching their house being searched.",
      conditional_narrative: [
        {
          condition: 'four_pct_hidden_discrepancies === true',
          snippet: " You volunteered the hidden discrepancies from the Four Percent Problem. " +
            "The lead reviewer paused. 'You're telling us this voluntarily?' she asked. " +
            "'Yes,' you said. 'Before you found it.' She made a note. 'That will be reflected in our report.'",
        },
        {
          condition: 'four_pct_knowingly_processed === true',
          snippet: " The decision to knowingly process incorrect transactions was documented in your own board papers. " +
            "The PRA team did not need to search for this one. It was on page three.",
        },
        {
          condition: 'conservative_choices_count >= 4',
          snippet: " The review team found remarkably little to criticise. Your General Counsel looked almost disappointed — " +
            "she'd prepared for a siege and got a garden party. The lead reviewer described Steadfast's risk management as " +
            "'conservative but well-governed.' The board wasn't sure whether this was a compliment.",
        },
        {
          condition: 'yield_grab_leverage === true',
          snippet: " The leveraged gilt positions drew particular attention. 'This is a significant concentration,' " +
            "the lead reviewer observed, in the carefully neutral tone regulators use when they mean 'this terrifies me.'",
        },
        {
          condition: 'cto_warned_in_writing === true',
          snippet: " The CTO's written warning about the systems estate was in the file. " +
            "The PRA team read it carefully. 'And the response to this was...?' asked the lead reviewer. " +
            "'We deferred the investment,' you said. She wrote something down. It was a long something.",
        },
      ],
      compounding_effects: [
        { key: 'regulator_response', value: 'full_transparency' },
        { key: 'regulator_cooperation_credit', value: true },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'regulator_review_opt2',
      label: 'Controlled disclosure — volunteer the obvious, stay quiet on the rest',
      description:
        "Cooperate fully with what they ask for. Answer every question honestly. " +
        "But don't volunteer information they haven't specifically requested. " +
        "Not dishonest — just not exhaustively forthcoming.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -3,
        board_confidence: -2,
        reputation: -3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If clean, controlled disclosure works fine
        {
          condition: 'conservative_choices_count >= 4',
          impact: { regulatory_standing: -1, reputation: 3 },
        },
        // Hidden discrepancies — may or may not be found
        {
          condition: 'four_pct_hidden_discrepancies === true',
          impact: { reputation: -2 }, // base penalty; review_thoroughness determines if found
        },
        // Thorough review finds hidden issues
        {
          condition: 'review_thoroughness === thorough',
          impact: { regulatory_standing: 1, reputation: -3 },
        },
        // Forensic review finds everything AND penalises you for not volunteering
        {
          condition: 'review_thoroughness === forensic',
          impact: { regulatory_standing: 2, reputation: -8, board_confidence: -5, cumulative_pnl: -10 },
        },
        // Knowingly processed — if forensic, this is very bad because you didn't volunteer it
        {
          condition: 'four_pct_knowingly_processed === true',
          impact: { regulatory_standing: 1 },
        },
        // Quiet position reduction — may surface
        {
          condition: 'quiet_reduction_leak_risk === true',
          impact: { reputation: -3 },
        },
        // PRA MA scrutiny — they already know about this
        {
          condition: 'pra_ma_scrutiny === true',
          impact: { regulatory_standing: 1, cumulative_pnl: -5 },
        },
        // Leverage
        {
          condition: 'yield_grab_leverage === true',
          impact: { regulatory_standing: 1 },
        },
        // Systems investment gets credit
        {
          condition: 'systems_funded === true',
          impact: { regulatory_standing: -1 },
        },
        // Formal memo — they'll find this in the files
        {
          condition: 'formal_memo_filed === true',
          impact: { regulatory_standing: 1, board_confidence: -2 },
        },
      ],
      narrative_snippet:
        "You cooperated. Answered every question. Provided every document requested. " +
        "You just didn't go out of your way to point out the things they hadn't asked about yet.",
      conditional_narrative: [
        {
          condition: 'review_thoroughness === forensic',
          snippet: " The lead reviewer turned out to be a former Chief Actuary from a competitor. " +
            "She knew exactly where to look and exactly what questions to ask. " +
            "By day four, she had found things your own internal audit hadn't. " +
            "'I notice you didn't mention this in your initial disclosure,' she said, " +
            "placing a document on the table. Your General Counsel's face did something involuntary.",
        },
        {
          condition: 'review_thoroughness === routine',
          snippet: " The review team was competent but stretched — they were running six reviews simultaneously. " +
            "They focused on the headline items and moved on. Your General Counsel exhaled for what seemed like " +
            "the first time in three weeks.",
        },
        {
          condition: 'four_pct_hidden_discrepancies === true',
          snippet: " The Four Percent Problem file sat in a cabinet. Whether they would open it " +
            "depended entirely on how thorough the review team chose to be.",
        },
        {
          condition: 'cto_warned_in_writing === true',
          snippet: " The CTO's written warning was in the risk committee files. " +
            "The review team requested risk committee minutes as standard. You hoped they'd focus on the recent ones.",
        },
      ],
      compounding_effects: [
        { key: 'regulator_response', value: 'controlled_disclosure' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'regulator_review_opt3',
      label: 'Challenge the scope — push back through lawyers',
      description:
        "Engage external counsel to challenge the legal basis for certain lines of inquiry. " +
        "Slow-walk document production on contested areas. Argue that some requests are disproportionate. " +
        "The PRA does not enjoy being challenged.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -5,
        board_confidence: -2,
        reputation: 0,
        regulatory_standing: 1,
      },
      conditional_consequences: [
        // If you're actually clean, challenging looks aggressive for no reason
        {
          condition: 'conservative_choices_count >= 4',
          impact: { regulatory_standing: 1, board_confidence: -3, reputation: -5 },
        },
        // If you have skeletons, challenging buys time but increases severity when found
        {
          condition: 'four_pct_hidden_discrepancies === true',
          impact: { cumulative_pnl: -5 },
        },
        {
          condition: 'four_pct_knowingly_processed === true',
          impact: { regulatory_standing: 1, cumulative_pnl: -8 },
        },
        // Forensic review sees through the legal strategy
        {
          condition: 'review_thoroughness === forensic',
          impact: { regulatory_standing: 2, reputation: -10, board_confidence: -8, cumulative_pnl: -15 },
        },
        // Routine review may be successfully slowed
        {
          condition: 'review_thoroughness === routine',
          impact: { regulatory_standing: -1, cumulative_pnl: 3 },
        },
        // PRA already watching the MA — challenging on this front irritates them
        {
          condition: 'pra_ma_scrutiny === true',
          impact: { regulatory_standing: 1, cumulative_pnl: -5 },
        },
        // Leverage — they already have concerns, lawyering up makes it worse
        {
          condition: 'yield_grab_leverage === true',
          impact: { regulatory_standing: 1, board_confidence: -3 },
        },
      ],
      narrative_snippet:
        "You brought in Freshfields. At £1,200 an hour, they challenged the scope of the review, " +
        "the legal basis for certain document requests, and the proportionality of the PRA's approach. " +
        "The PRA team leader received the letter from your lawyers, read it carefully, and then requested " +
        "a meeting with your board. This is the regulatory equivalent of bringing a parent to a school meeting.",
      conditional_narrative: [
        {
          condition: 'review_thoroughness === forensic',
          snippet: " The lead reviewer was unimpressed by the legal strategy. 'In my experience,' " +
            "she told your General Counsel, 'firms that engage external lawyers at this stage " +
            "are usually trying to slow us down for a reason. We will be recommending an extended review.' " +
            "The extended review found everything. The legal fees exceeded £2m.",
        },
        {
          condition: 'review_thoroughness === routine',
          snippet: " The legal pushback worked, to a degree. The review team, already stretched, " +
            "accepted a narrower scope for some of the more contentious areas. " +
            "Your General Counsel called it a victory. Your Head of Compliance called it 'storing up trouble.'",
        },
        {
          condition: 'conservative_choices_count >= 4',
          snippet: " The PRA team found almost nothing of substance, which made the legal pushback look " +
            "bizarre in hindsight. 'Why did they lawyer up if there was nothing to find?' became " +
            "a question asked at PRA internal meetings. Your name was flagged for enhanced supervision " +
            "on the next cycle.",
        },
      ],
      compounding_effects: [
        { key: 'regulator_response', value: 'challenge_scope' },
        { key: 'pra_enhanced_supervision', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
    {
      id: 'regulator_review_opt4',
      label: 'Remediation blitz — fix everything before they arrive',
      description:
        "You have three weeks. Use them. Commission emergency internal reviews. " +
        "Fix what can be fixed. Close open items. Update documentation. " +
        "Expensive and exhausting, but when the PRA arrives, the house will be in order. " +
        "Or at least the rooms they're likely to look in.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -5,
        board_confidence: -3,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If you've got systems, remediation is more effective
        {
          condition: 'systems_funded === true',
          impact: { cumulative_pnl: 3, regulatory_standing: -1 },
        },
        // Hidden discrepancies — can be fixed before they arrive
        {
          condition: 'four_pct_hidden_discrepancies === true',
          impact: { cumulative_pnl: -5, regulatory_standing: -1 },
        },
        // But knowingly processing can't be un-done — it's in the record
        {
          condition: 'four_pct_knowingly_processed === true',
          impact: { regulatory_standing: 1 },
        },
        // Forensic review may notice the remediation was suspiciously recent
        {
          condition: 'review_thoroughness === forensic',
          impact: { regulatory_standing: 1, reputation: -3, board_confidence: -2 },
        },
        // Routine review sees a tidy house
        {
          condition: 'review_thoroughness === routine',
          impact: { regulatory_standing: -1, reputation: 3 },
        },
        // PRA MA scrutiny — harder to remediate
        {
          condition: 'pra_ma_scrutiny === true',
          impact: { regulatory_standing: 1, cumulative_pnl: -5 },
        },
        // If no systems, remediation is manual and incomplete
        {
          condition: 'systems_funded !== true',
          impact: { cumulative_pnl: -5 },
        },
        // Formal memo — can't make it disappear, but can demonstrate response
        {
          condition: 'formal_memo_filed === true',
          impact: { board_confidence: -2 },
        },
      ],
      narrative_snippet:
        "You had three weeks. You used every hour. Emergency reviews. Gap analyses. Documentation updates. " +
        "Your compliance team worked weekends. Your internal audit team was redeployed. " +
        "Two consultancies were engaged at short notice. The CFO questioned the cost. " +
        "'It's cheaper than a fine,' you said. You hoped you were right.",
      conditional_narrative: [
        {
          condition: 'systems_funded === true',
          snippet: " The modernised systems made the remediation considerably more effective. " +
            "Data could be pulled, reconciled, and documented in hours rather than weeks. " +
            "The CTO, for once, said nothing. His systems were speaking for themselves.",
        },
        {
          condition: 'systems_funded !== true',
          snippet: " Without modern systems, the remediation was a manual nightmare. " +
            "Janet was asked to produce reports that the legacy platform couldn't generate. " +
            "She did her best. Several of the spreadsheets had formatting errors that nobody noticed " +
            "until the PRA team did.",
        },
        {
          condition: 'review_thoroughness === forensic',
          snippet: " The lead reviewer noticed that several documents had been updated in the fortnight " +
            "before her arrival. 'Quite a lot of activity in the last few weeks,' she observed. " +
            "'Good housekeeping,' your General Counsel replied. " +
            "The reviewer's expression suggested she had heard this before.",
        },
        {
          condition: 'four_pct_hidden_discrepancies === true',
          snippet: " The Four Percent Problem discrepancies were quietly corrected. " +
            "New calculations, new letters, new records. Whether the PRA would notice " +
            "the timing of the corrections was another question entirely.",
        },
      ],
      compounding_effects: [
        { key: 'regulator_response', value: 'remediation_blitz' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'regulator_review_opt5',
      label: 'Cooperate fully AND offer to be a thematic review case study',
      description:
        "Go beyond compliance. Offer to share your experience — including your mistakes — " +
        "as an industry case study for PRA guidance. Turns a regulatory exercise into " +
        "a thought leadership opportunity. Bold, and only works if the regulator takes it seriously.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -3,
        board_confidence: -4,
        reputation: 5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If you're actually clean, this is a genuine thought leadership play
        {
          condition: 'conservative_choices_count >= 4',
          impact: { reputation: 10, regulatory_standing: -2, board_confidence: 5 },
        },
        // If you have moderate issues, the offer looks earnest
        {
          condition: 'four_pct_proactive_disclosure === true',
          impact: { regulatory_standing: -1, reputation: 5 },
        },
        // If you have significant issues, offering to be a case study looks naive or cynical
        {
          condition: 'four_pct_knowingly_processed === true',
          impact: { regulatory_standing: 1, reputation: -8, board_confidence: -5 },
        },
        {
          condition: 'four_pct_hidden_discrepancies === true',
          impact: { regulatory_standing: 1, reputation: -5 },
        },
        // Leverage positions make the offer look tone-deaf
        {
          condition: 'yield_grab_leverage === true',
          impact: { regulatory_standing: 1, reputation: -5, board_confidence: -3 },
        },
        // Systems funded — genuine story to tell
        {
          condition: 'systems_funded === true',
          impact: { reputation: 5, regulatory_standing: -1 },
        },
        // Forensic review — they appreciate the offer but still find everything
        {
          condition: 'review_thoroughness === forensic',
          impact: { regulatory_standing: 1, reputation: -3 },
        },
        // PRA MA scrutiny — you can't thought-lead your way out of this
        {
          condition: 'pra_ma_scrutiny === true',
          impact: { regulatory_standing: 1, reputation: -5 },
        },
      ],
      narrative_snippet:
        "You made an unusual offer: full cooperation, plus a willingness to be written up " +
        "as an anonymised case study in the PRA's thematic review findings. " +
        "'Let other firms learn from our experience,' you said. " +
        "Your General Counsel's eyebrow achieved an altitude previously unrecorded.",
      conditional_narrative: [
        {
          condition: 'conservative_choices_count >= 4',
          snippet: " The PRA accepted. Your firm's story — conservative governance, disciplined risk appetite, " +
            "boring but effective — became 'Firm C' in the published thematic findings. " +
            "Three headhunters called the following week. The board, grudgingly, was impressed.",
        },
        {
          condition: 'four_pct_knowingly_processed === true',
          snippet: " The PRA accepted your offer and then found the knowingly processed transactions. " +
            "'This is an interesting case study,' the lead reviewer said. 'Not in the way you intended.' " +
            "Steadfast became 'Firm D' in the findings — the example of what not to do. " +
            "Your General Counsel updated her own CV.",
        },
        {
          condition: 'yield_grab_leverage === true',
          snippet: " Offering to be a case study while running leveraged positions across multiple books " +
            "struck the PRA as either admirably transparent or remarkably unaware. " +
            "The lead reviewer couldn't quite decide which. Neither could your board.",
        },
        {
          condition: 'systems_funded === true',
          snippet: " The systems investment story played well. The PRA highlighted it as " +
            "an example of long-term operational thinking. The CTO was invited to present " +
            "at a PRA roundtable. He wore a new suit.",
        },
      ],
      compounding_effects: [
        { key: 'regulator_response', value: 'case_study' },
        { key: 'regulator_cooperation_credit', value: true },
      ],
      strategy_alignment: 'growth',
    },
  ],
  preconditions: [
    // These modify the scenario based on prior choices
    {
      key: 'yield_grab_leverage',
      setup_text_modifier:
        "The letter arrives on a Tuesday morning, which is when bad news always arrives. " +
        "It is from the Prudential Regulation Authority. It is polite in the way that letters " +
        "from regulators are polite, which is to say it is not polite at all.\n\n" +
        "'Dear Chief Risk Officer,' it begins. 'As part of our ongoing thematic review of " +
        "risk management practices in the life insurance sector, we are writing to inform you " +
        "that Steadfast Group has been selected for a deep-dive supervisory assessment.'\n\n" +
        "Selected. As if it were a prize.\n\n" +
        "The review will cover governance, risk appetite, asset quality, operational resilience, " +
        "and conduct. A team of six will arrive in three weeks. They will want access to everything. " +
        "Board minutes. Risk committee papers. Internal audit reports. Model validation records. " +
        "The CTO's slide deck. Janet's spreadsheets. Derek's documentation, such as it is.\n\n" +
        "Your General Counsel has already flagged that the leveraged gilt positions and concentrated " +
        "credit exposures will attract immediate attention. 'They will find those in the first hour,' " +
        "she says. 'The question is what else they find in the remaining three weeks.'\n\n" +
        "You have three weeks to prepare. The question is not whether they will find something. " +
        "The question is how much you tell them before they find it themselves.\n\n" +
        "Your General Counsel has cleared her afternoon. And her calendar for the next month.",
    },
    {
      key: 'four_pct_hidden_discrepancies',
      option_modifiers: [
        {
          option_id: 'regulator_review_opt2',
          consequence_adjustments: { regulatory_standing: 1, reputation: -3 },
        },
        {
          option_id: 'regulator_review_opt3',
          consequence_adjustments: { regulatory_standing: 1, cumulative_pnl: -5 },
        },
      ],
    },
    {
      key: 'four_pct_knowingly_processed',
      option_modifiers: [
        {
          option_id: 'regulator_review_opt2',
          consequence_adjustments: { regulatory_standing: 1 },
        },
        {
          option_id: 'regulator_review_opt3',
          consequence_adjustments: { regulatory_standing: 2, cumulative_pnl: -10 },
        },
      ],
    },
    {
      key: 'formal_memo_filed',
      option_modifiers: [
        {
          option_id: 'regulator_review_opt2',
          consequence_adjustments: { board_confidence: -2 },
        },
      ],
    },
  ],
};
