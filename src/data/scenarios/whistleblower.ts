import type { Scenario } from '../../types/scenario.js';

export const whistleblower: Scenario = {
  id: 'whistleblower',
  title: 'The Anonymous Letter',
  category: 'stakeholder',
  division: 'group',
  year_range: [3, 5],
  is_tentpole: false,
  illustration_key: 'whistleblower',
  setup_text:
    "The company secretary appears at your door with an expression that sits somewhere between " +
    "concern and dread. She is holding a letter — not an email, an actual letter, printed on paper, " +
    "in an envelope, with a stamp.\n\n" +
    "'This was sent to the PRA,' she says. 'They've forwarded it to us under the whistleblowing protocols. " +
    "It's also been copied to the Chair of the Audit Committee.'\n\n" +
    "The letter alleges that Graham Doyle, Head of Reserving, has been systematically under-reserving " +
    "on a legacy book of critical illness policies. Graham has been at the firm for twenty-two years. " +
    "He is the CEO's closest ally on the executive committee. He plays in the CEO's regular Sunday " +
    "tennis doubles. He is, by all accounts, a competent actuary who has been with the firm since " +
    "it was a mutual.\n\n" +
    "The letter is specific. It cites policy numbers. It references internal emails. It mentions " +
    "a reserving committee meeting from nine months ago where Graham allegedly overruled two junior " +
    "actuaries who had recommended a £35m reserve strengthening. The letter says he described their " +
    "analysis as 'over-prudent' and substituted his own figures.\n\n" +
    "The letter is unsigned, but whoever wrote it has access to reserving committee minutes, " +
    "internal email chains, and the reserving model output. The list of people with that access " +
    "is short.\n\n" +
    "The PRA has asked for a formal response within twenty-eight days.\n\n" +
    "Graham is in a meeting. Caroline — the CEO — is on a plane to New York.",
  random_params: {
    // Whether the allegations are substantiated
    allegations_substance: {
      type: 'discrete',
      outcomes: [
        { value: 'unfounded', weight: 1 },      // ~20% — genuine professional disagreement, no under-reserving
        { value: 'partially_true', weight: 2 },   // ~40% — some under-reserving, but less than alleged
        { value: 'fully_substantiated', weight: 2 }, // ~40% — it's all true and possibly worse
      ],
    },
    // Whether the whistleblower is identified (and retaliates if mistreated)
    whistleblower_identified: { type: 'bernoulli', probability: 0.3 },
  },
  options: [
    {
      id: 'whistleblower_opt1',
      label: 'Independent investigation — appoint external counsel immediately',
      description:
        "Engage a law firm with no existing relationship to Steadfast. Full forensic review " +
        "of the reserving book, committee minutes, and internal communications. " +
        "Graham is suspended pending the outcome. Expensive, disruptive, but thorough.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -5,
        board_confidence: -3,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Unfounded — investigation was expensive overkill
        {
          condition: 'allegations_substance === unfounded',
          impact: { cumulative_pnl: -3, board_confidence: -5, reputation: -3 },
        },
        // Fully substantiated — you handled it correctly
        {
          condition: 'allegations_substance === fully_substantiated',
          impact: { regulatory_standing: -1, board_confidence: 5, reputation: 5, solvency_ratio: -5 },
        },
        // Partially true — proportionate response
        {
          condition: 'allegations_substance === partially_true',
          impact: { board_confidence: 2, solvency_ratio: -2 },
        },
        // CEO relationship affects how Graham's suspension plays
        {
          condition: 'ceo_relationship_strained === true',
          impact: { board_confidence: -3 },
        },
      ],
      narrative_snippet:
        "You appointed Clifford Chance within forty-eight hours. Graham was suspended on full pay. " +
        "He took it with the quiet fury of a man who has given twenty-two years to an institution " +
        "and been rewarded with a letter from HR. Caroline, reached in New York, asked " +
        "'Is this really necessary?' You said yes. She said nothing further, which was worse.",
      conditional_narrative: [
        {
          condition: 'allegations_substance === unfounded',
          snippet: " The investigation concluded after eight weeks and £400,000 in legal fees. " +
            "Graham's reserving was conservative by some measures, aggressive by others, " +
            "but within actuarial standards. The junior actuaries had been right that reserves could be higher. " +
            "Graham had been right that they didn't need to be. It was a professional disagreement, " +
            "not misconduct. Graham returned to his desk. He did not return to being the same person.",
        },
        {
          condition: 'allegations_substance === fully_substantiated',
          snippet: " Clifford Chance's report was damning. The critical illness reserves were understated " +
            "by £42m. Graham had overruled the junior actuaries not because their analysis was wrong, " +
            "but because the strengthening would have triggered a solvency ratio breach in Q3 — " +
            "the quarter the board was being assessed for bonuses. The report included email extracts. " +
            "They were unambiguous. Graham was dismissed for gross misconduct. " +
            "Caroline cancelled her tennis doubles.",
        },
        {
          condition: 'allegations_substance === partially_true',
          snippet: " The truth, as usual, was complicated. The reserves were light — by about £18m, " +
            "not the £35m alleged. Graham's judgement had been poor but not dishonest. " +
            "The junior actuaries had been substantially correct. Graham was given a formal warning, " +
            "the reserves were strengthened, and the reserving committee terms of reference were rewritten " +
            "to require documented rationale for any deviation from the recommended basis.",
        },
      ],
      compounding_effects: [
        { key: 'whistleblower_response', value: 'independent_investigation' },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'whistleblower_opt2',
      label: 'Internal review — have Internal Audit investigate',
      description:
        "Use the existing Internal Audit function. They know the business, they know the people, " +
        "and they cost nothing incremental. But the PRA may question their independence — " +
        "Internal Audit reports to the Audit Committee, but Graham plays tennis with the CEO.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -1,
        board_confidence: 2,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Fully substantiated — internal review looks like a whitewash
        {
          condition: 'allegations_substance === fully_substantiated',
          impact: { regulatory_standing: 2, board_confidence: -8, reputation: -8, solvency_ratio: -5 },
        },
        // Unfounded — internal review is proportionate
        {
          condition: 'allegations_substance === unfounded',
          impact: { board_confidence: 3, reputation: 2 },
        },
        // Partially true — PRA may question independence
        {
          condition: 'allegations_substance === partially_true',
          impact: { regulatory_standing: 1, solvency_ratio: -2 },
        },
      ],
      narrative_snippet:
        "You asked Internal Audit to investigate. The Head of Internal Audit — a careful, " +
        "methodical woman called Fiona — accepted the assignment with visible reluctance. " +
        "'You understand that Graham reports to the CEO, who chairs ExCo, who set my team's budget,' " +
        "she said. 'I understand the reporting lines,' you replied. " +
        "'I'm asking whether you understand the incentives,' she clarified.",
      conditional_narrative: [
        {
          condition: 'allegations_substance === fully_substantiated',
          snippet: " Fiona's report confirmed the under-reserving but her recommendations were diplomatic " +
            "where they should have been blunt. The PRA read the report and commissioned their own " +
            "independent review. The independent review found more than Fiona had. " +
            "The PRA wrote to the Chair expressing 'concerns about the independence and rigour " +
            "of the firm's internal investigation.' The word 'whitewash' was not used. It was implied.",
        },
        {
          condition: 'allegations_substance === unfounded',
          snippet: " Fiona's review was thorough and concluded that Graham's reserving judgements, " +
            "while at the optimistic end of the range, were within professional standards. " +
            "The PRA accepted the findings. The proportionate response looked like proportionate judgement.",
        },
      ],
      compounding_effects: [
        { key: 'whistleblower_response', value: 'internal_review' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'whistleblower_opt3',
      label: 'Confront Graham directly — give him the chance to explain',
      description:
        "Before launching any formal process, sit down with Graham and show him the letter. " +
        "He's been here twenty-two years. He deserves to be heard. " +
        "But if the allegations are true, you've just warned the suspect.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: -3,
        reputation: -2,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If true, Graham now has time to cover tracks or resign
        {
          condition: 'allegations_substance === fully_substantiated',
          impact: { regulatory_standing: 2, board_confidence: -15, reputation: -10, cumulative_pnl: -8, solvency_ratio: -5 },
        },
        // Unfounded — fair and decent approach
        {
          condition: 'allegations_substance === unfounded',
          impact: { board_confidence: 5, reputation: 3 },
        },
        // Partially true — Graham adjusts the narrative
        {
          condition: 'allegations_substance === partially_true',
          impact: { regulatory_standing: 1, board_confidence: -3, solvency_ratio: -2 },
        },
        // Whistleblower identified and feels unsafe
        {
          condition: 'whistleblower_identified === true',
          impact: { regulatory_standing: 1, reputation: -5 },
        },
      ],
      narrative_snippet:
        "You invited Graham to your office. You showed him the letter. He read it twice, " +
        "slowly. His face went through several colours. 'This is — who wrote this?' he asked. " +
        "'It's anonymous,' you said. 'I can see that,' he replied. 'I'm asking who.'",
      conditional_narrative: [
        {
          condition: 'allegations_substance === fully_substantiated',
          snippet: " Graham resigned the following Tuesday, citing 'personal reasons.' " +
            "He took his laptop home over the weekend. The IT security team later discovered " +
            "that several email folders had been permanently deleted. The PRA was not impressed. " +
            "'You showed the subject of a whistleblowing allegation the evidence against him ' +\n" +
            "            'before conducting any investigation,' the supervisor noted. " +
            "'That is not consistent with the firm's obligations under the whistleblowing regulations.'",
        },
        {
          condition: 'allegations_substance === unfounded',
          snippet: " Graham's explanation was calm, detailed, and supported by documentation. " +
            "The junior actuaries had used an overly conservative morbidity table. " +
            "Graham's judgement had been reasonable. He was hurt, visibly, by the accusation. " +
            "'Twenty-two years,' he said. 'And someone can't even put their name to it.'",
        },
        {
          condition: 'whistleblower_identified === true',
          snippet: " Within a week, the identity of the whistleblower had leaked — one of the two junior " +
            "actuaries who'd been overruled. She was moved to a different team. She called it a demotion. " +
            "HR called it a 'role adjustment.' The PRA called it 'potential whistleblower detriment' " +
            "and opened a separate investigation.",
        },
      ],
      compounding_effects: [
        { key: 'whistleblower_response', value: 'confronted_subject' },
      ],
      strategy_alignment: 'aggressive',
    },
    {
      id: 'whistleblower_opt4',
      label: 'Wait for Caroline — brief the CEO before taking any action',
      description:
        "Caroline lands in twelve hours. Graham is her ally. Any action you take without " +
        "consulting her will have political consequences. Wait for her return, " +
        "brief her personally, and decide together. But the PRA clock is ticking.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: 0,
        reputation: -2,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Fully substantiated — delay looks like cover-up
        {
          condition: 'allegations_substance === fully_substantiated',
          impact: { regulatory_standing: 1, board_confidence: -3, reputation: -5 },
        },
        {
          condition: 'ceo_relationship_strained === true',
          impact: { board_confidence: -3, reputation: -2 },
        },
        {
          condition: 'ceo_relationship_strained !== true',
          impact: { board_confidence: 5 },
        },
      ],
      narrative_snippet:
        "You waited for Caroline. She landed at Heathrow at 6am, read the letter in her car, " +
        "and called you from the M4. 'Don't do anything until I get in,' she said. " +
        "She arrived at 8:15, jet-lagged and furious — though it was unclear whether the fury " +
        "was directed at the allegations, the whistleblower, or the fact that you hadn't acted already.",
      conditional_narrative: [
        {
          condition: 'ceo_relationship_strained === true',
          snippet: " Caroline's response was territorial. 'Graham reports to me. I'll handle this.' " +
            "She appointed a partner from the firm's existing lawyers — a firm that also advises the CEO " +
            "on her personal remuneration. The investigation was brisk, exculpatory, and unconvincing. " +
            "The PRA noted the choice of investigator.",
        },
        {
          condition: 'ceo_relationship_strained !== true',
          snippet: " Caroline listened, asked three precise questions, and made a decision within the hour. " +
            "'Independent external counsel. Not our usual firm. And Graham stays in post until we know the facts — " +
            "but he doesn't attend reserving committee until the review is complete.' " +
            "It was decisive, proportionate, and exactly what you would have recommended.",
        },
        {
          condition: 'allegations_substance === fully_substantiated',
          snippet: " The delay in acting — while only twelve hours — was noted in the PRA's timeline. " +
            "In the supervisor's words: 'The firm prioritised internal political considerations " +
            "over the timely investigation of a serious whistleblowing disclosure.'",
        },
      ],
      compounding_effects: [
        { key: 'whistleblower_response', value: 'waited_for_ceo' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'whistleblower_opt5',
      label: 'Parallel track — secure the evidence and protect the whistleblower first',
      description:
        "Before anything else, preserve all relevant emails, documents, and model outputs. " +
        "Ensure the whistleblowing policy protections are actively enforced. " +
        "Then commission the investigation. Evidence first, politics second.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -3,
        board_confidence: -2,
        reputation: 3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Fully substantiated — evidence preservation is critical
        {
          condition: 'allegations_substance === fully_substantiated',
          impact: { regulatory_standing: -1, board_confidence: 3, reputation: 5, solvency_ratio: -5 },
        },
        // Unfounded — looked like you assumed guilt
        {
          condition: 'allegations_substance === unfounded',
          impact: { board_confidence: -5, reputation: -2 },
        },
        // Whistleblower identified — protection measures were prescient
        {
          condition: 'whistleblower_identified === true',
          impact: { reputation: 5, regulatory_standing: -1 },
        },
        {
          condition: 'systems_funded === true',
          impact: { cumulative_pnl: 2, board_confidence: 2 },
        },
      ],
      narrative_snippet:
        "Before you spoke to anyone, you called IT and asked them to place a litigation hold " +
        "on all of Graham's emails, the reserving committee shared drive, and the model output archive. " +
        "Then you called the compliance officer and asked her to review the whistleblower protection " +
        "procedures. Then — and only then — did you pick up the phone to Caroline.",
      conditional_narrative: [
        {
          condition: 'allegations_substance === fully_substantiated',
          snippet: " The evidence preservation was critical. When Graham's email folders were later found " +
            "to have been selectively archived, the litigation hold meant IT had the complete originals. " +
            "The forensic trail was intact. Clifford Chance later noted that 'the firm's immediate " +
            "evidence preservation measures were instrumental in establishing the facts.' " +
            "The PRA's assessment credited 'exemplary whistleblowing governance.'",
        },
        {
          condition: 'allegations_substance === unfounded',
          snippet: " The litigation hold and the compliance review turned out to be unnecessary. " +
            "Graham learned about the evidence preservation and interpreted it — not unreasonably — " +
            "as a presumption of guilt. 'You froze my emails before you even asked me what happened,' " +
            "he said. His relationship with you never fully recovered. Nor did his tennis serve, " +
            "but that was unrelated.",
        },
        {
          condition: 'whistleblower_identified === true',
          snippet: " When the whistleblower's identity emerged — inevitably, despite your precautions — " +
            "the protection measures you'd already put in place prevented any retaliation. " +
            "The junior actuary remained in her role, with documented support from HR. " +
            "The PRA cited the firm's whistleblower protection as 'good practice.'",
        },
      ],
      compounding_effects: [
        { key: 'whistleblower_response', value: 'evidence_first' },
      ],
      strategy_alignment: 'conservative',
    },
  ],
  preconditions: [
    {
      key: 'assumptions_manipulated',
      option_modifiers: [
        {
          option_id: 'whistleblower_opt1',
          consequence_adjustments: { regulatory_standing: 1, board_confidence: -3 },
          narrative_override:
            "You appointed external counsel immediately. But the investigation didn't just find " +
            "Graham's reserving issues — it also uncovered the assumption adjustments you'd approved " +
            "on the longevity model. 'The pattern of assumption manipulation extends beyond the CI book,' " +
            "the report noted. You were no longer just investigating Graham. " +
            "You were part of the story.",
        },
      ],
    },
  ],
};
