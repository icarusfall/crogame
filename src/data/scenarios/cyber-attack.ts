import type { Scenario } from '../../types/scenario.js';

export const cyberAttack: Scenario = {
  id: 'cyber_attack',
  title: 'The Compromised Feed',
  category: 'operational',
  division: 'group',
  year_range: [2, 4],
  is_tentpole: false,
  illustration_key: 'scene_ops_team',
  setup_text:
    "Duncan MacLeod, Head of IT Security, is not a man who panics. He has worked in cybersecurity " +
    "for twenty years. He has seen nation-state attacks, ransomware, and a CEO who once clicked " +
    "on a link in an email titled 'Your Amazon Package Is Delayed' from an address ending in .ru.\n\n" +
    "Today, Duncan is as close to panicking as you have ever seen him.\n\n" +
    "'The Meridian pricing feed has been compromised,' he says. 'We don't know for how long. " +
    "Somewhere between two and six weeks. The daily prices on approximately four hundred fixed income " +
    "securities have been subtly wrong — not dramatically wrong, 5 to 15 basis points in a consistent " +
    "direction. Enough to affect valuations. Enough to affect trades.'\n\n" +
    "He pulls up a chart. The discrepancy was spotted by a junior analyst called Tomasz who noticed " +
    "that his gilt prices didn't match Bloomberg. Tomasz is twenty-four years old and has been " +
    "at the firm for seven months. He will, in due course, be the hero of this story, " +
    "but right now he is sitting at his desk looking like he wishes he'd never said anything.\n\n" +
    "'The question,' says Duncan, 'is how deep this goes. If it's just the pricing feed, " +
    "we can reconstruct the correct values from Bloomberg and reprice everything. " +
    "If the compromised prices fed through to client valuations, fund NAVs, and regulatory returns, " +
    "we have a much larger problem.'\n\n" +
    "He pauses. 'I need to know how public you want this to be.'",
  random_params: {
    breach_duration_weeks: { type: 'uniform', min: 2, max: 6, unit: 'weeks' },
    breach_depth: {
      type: 'discrete',
      outcomes: [
        { value: 'contained', weight: 2 },     // ~40% — pricing feed only, limited impact
        { value: 'moderate', weight: 2 },       // ~40% — fed through to some client valuations
        { value: 'deep', weight: 1 },            // ~20% — affected fund NAVs and regulatory returns
      ],
    },
  },
  options: [
    {
      id: 'cyber_opt1',
      label: 'Full lockdown — isolate systems, notify FCA, engage forensics',
      description:
        "Treat it as a major incident. Disconnect the Meridian feed immediately. " +
        "Engage an external forensic team. Notify the FCA and ICO within 24 hours. " +
        "Comprehensive but disruptive — trading and client servicing will be affected.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -4,
        board_confidence: -3,
        reputation: -3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Contained breach — lockdown was overkill
        {
          condition: 'breach_depth === contained',
          impact: { reputation: 3, board_confidence: -3, cumulative_pnl: 3 },
        },
        // Deep breach — lockdown was essential
        {
          condition: 'breach_depth === deep',
          impact: { regulatory_standing: 1, reputation: 5, board_confidence: 5 },
        },
        // Systems funded — forensics is faster and cleaner
        {
          condition: 'systems_funded === true',
          impact: { cumulative_pnl: 3, board_confidence: 3, regulatory_standing: -1 },
        },
      ],
      narrative_snippet:
        "You went full lockdown. External forensics. FCA notification. The Meridian feed was disconnected " +
        "within the hour. Trading moved to manual pricing from Bloomberg. The operations team worked " +
        "through the night. Tomasz was given a commendation and a very confused expression.",
      conditional_narrative: [
        {
          condition: 'breach_depth === contained',
          snippet: " The forensic review concluded that the compromise was limited to the pricing feed. " +
            "No client valuations were materially affected. The lockdown had been disproportionate " +
            "but nobody could fault the caution. The FCA closed their file within six weeks. " +
            "Duncan bought Tomasz a beer.",
        },
        {
          condition: 'breach_depth === deep',
          snippet: " The forensic review revealed that compromised prices had fed through to fund NAVs " +
            "for {breach_duration_weeks} weeks. Client valuations were affected. " +
            "Three regulatory returns contained incorrect figures. " +
            "The lockdown had been exactly the right call. The FCA acknowledged 'exemplary incident response.'",
        },
        {
          condition: 'systems_funded === true',
          snippet: " The modernised systems meant Duncan's team could forensically trace every price " +
            "through every downstream calculation. The reconstruction took three days instead of three weeks. " +
            "The CTO said nothing. He didn't need to.",
        },
      ],
      compounding_effects: [
        { key: 'cyber_response', value: 'full_lockdown' },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'cyber_opt2',
      label: 'Quiet fix — switch feed, reconstruct prices internally, tell no one',
      description:
        "Disconnect Meridian silently. Reconstruct correct prices from Bloomberg. " +
        "Reprice everything internally. If the impact is small, nobody needs to know. " +
        "If it's large, you've just concealed a cybersecurity incident.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -2,
        board_confidence: -2,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Contained — quiet fix works perfectly
        {
          condition: 'breach_depth === contained',
          impact: { board_confidence: 5, cumulative_pnl: 2 },
        },
        // Deep — concealment will come out
        {
          condition: 'breach_depth === deep',
          impact: { regulatory_standing: 2, reputation: -15, board_confidence: -18, cumulative_pnl: -10 },
        },
        // Moderate — might work, might not
        {
          condition: 'breach_depth === moderate',
          impact: { regulatory_standing: 1, reputation: -5 },
        },
        // Without systems, reconstruction is guesswork
        {
          condition: 'systems_funded !== true',
          impact: { cumulative_pnl: -3, board_confidence: -2 },
        },
      ],
      narrative_snippet:
        "You switched the feed and said nothing. Duncan's team reconstructed the correct prices " +
        "from Bloomberg and repriced everything they could find. 'Everything they could find' " +
        "is doing a lot of work in that sentence.",
      conditional_narrative: [
        {
          condition: 'breach_depth === contained',
          snippet: " It worked. The impact was limited. The repricing was clean. Nobody outside " +
            "Duncan's team ever knew. Six months later, Meridian sent a letter disclosing the breach " +
            "to all clients. Your response — already complete — was exemplary. " +
            "Duncan's report was filed and forgotten.",
        },
        {
          condition: 'breach_depth === deep',
          snippet: " It did not work. Three months later, a client's auditor noticed a discrepancy " +
            "between their own records and Steadfast's valuations during the affected period. " +
            "The FCA was informed by the client, not by you. " +
            "'Why were we not notified?' was the first question. There was no good answer.",
        },
        {
          condition: 'systems_funded !== true',
          snippet: " Without modern systems, Duncan's team couldn't trace every downstream impact. " +
            "They repriced what they could find. What they couldn't find repriced itself, eventually, " +
            "in the form of unexplained reconciliation breaks that the operations team spent months investigating.",
        },
      ],
      compounding_effects: [
        { key: 'cyber_response', value: 'quiet_fix' },
        { key: 'cyber_concealed', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
    {
      id: 'cyber_opt3',
      label: "Investigate first — give Duncan 72 hours to assess the scope",
      description:
        "Don't overreact. Let the security team determine the scope before deciding " +
        "how public to make it. Pragmatic, but 72 hours of continued exposure if the breach is ongoing.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -3,
        board_confidence: 1,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'breach_depth === deep',
          impact: { regulatory_standing: 1, cumulative_pnl: -5, reputation: -5 },
        },
        {
          condition: 'breach_depth === contained',
          impact: { board_confidence: 2, cumulative_pnl: 2 },
        },
        {
          condition: 'systems_funded === true',
          impact: { board_confidence: 2, cumulative_pnl: 2 },
        },
      ],
      narrative_snippet:
        "You gave Duncan seventy-two hours. He used sixty-eight of them. His team worked in shifts, " +
        "tracing every compromised price through every system it had touched. " +
        "Tomasz was redeployed from his normal duties. He turned out to be very good at this.",
      conditional_narrative: [
        {
          condition: 'breach_depth === contained',
          snippet: " Duncan's assessment was clear: contained to the pricing feed, no material downstream impact. " +
            "You switched providers, filed the incident report, and moved on. " +
            "A proportionate response to a contained problem.",
        },
        {
          condition: 'breach_depth === deep',
          snippet: " Duncan's assessment was grim: the compromised prices had fed through to client valuations " +
            "and regulatory returns. The 72-hour delay meant three more days of incorrect data. " +
            "The FCA would later note that 'the firm's initial response prioritised assessment over action.'",
        },
        {
          condition: 'systems_funded === true',
          snippet: " The modern systems meant Duncan could run a full impact assessment in half the time. " +
            "By hour thirty-six, he had a complete picture. The remaining time was spent on remediation " +
            "rather than investigation.",
        },
      ],
      compounding_effects: [
        { key: 'cyber_response', value: 'investigate_first' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'cyber_opt4',
      label: "Switch to Bloomberg backup, engage external forensics, notify board only",
      description:
        "Pragmatic middle ground. Stop the bleeding with an immediate feed switch. " +
        "Get external experts in. Brief the board but don't notify regulators yet — " +
        "wait until you know the scope. FCA notification within 72 hours if material.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -5,
        board_confidence: 2,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'breach_depth === deep',
          impact: { regulatory_standing: 1, cumulative_pnl: -5, reputation: -3 },
        },
        {
          condition: 'breach_depth === contained',
          impact: { board_confidence: 3, reputation: 3 },
        },
        {
          condition: 'systems_funded === true',
          impact: { cumulative_pnl: 2, board_confidence: 2 },
        },
      ],
      narrative_snippet:
        "You switched to the Bloomberg backup feed immediately, engaged CrowdStrike for external forensics, " +
        "and briefed the board that evening. 'We have a cybersecurity incident,' you told them. " +
        "'It is contained. We are investigating.' The board asked how this had happened. " +
        "Duncan explained. The board asked how to prevent it happening again. " +
        "Duncan explained that too. The board asked how much the external forensics would cost. " +
        "Duncan stopped explaining.",
      conditional_narrative: [
        {
          condition: 'breach_depth === deep',
          snippet: " CrowdStrike's report confirmed the worst: the breach had been active for {breach_duration_weeks} weeks " +
            "and had affected downstream systems. The FCA was notified on day three. " +
            "They noted the delay but accepted the rationale. It could have been worse.",
        },
        {
          condition: 'breach_depth === contained',
          snippet: " CrowdStrike confirmed the breach was limited to the pricing feed. " +
            "The board was relieved. Duncan was quietly promoted. Tomasz was given a permanent role. " +
            "The Meridian contract was terminated.",
        },
      ],
      compounding_effects: [
        { key: 'cyber_response', value: 'pragmatic_response' },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'cyber_opt5',
      label: "Go public — disclose to clients, regulators, and market simultaneously",
      description:
        "Maximum transparency. Issue a market announcement. Notify all affected clients. " +
        "Show leadership on cybersecurity. Risk: the market may overreact to a problem " +
        "that turns out to be small.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: -3,
        board_confidence: -5,
        reputation: -5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Deep breach — going public first looks like leadership
        {
          condition: 'breach_depth === deep',
          impact: { reputation: 10, board_confidence: 5, regulatory_standing: -1 },
        },
        // Contained — going public on a nothing story looks panicked
        {
          condition: 'breach_depth === contained',
          impact: { reputation: -10, board_confidence: -5 },
        },
        // Moderate — mixed reaction
        {
          condition: 'breach_depth === moderate',
          impact: { reputation: 3, board_confidence: -2 },
        },
      ],
      narrative_snippet:
        "You went public. Full disclosure. Market announcement, client letters, FCA notification, " +
        "all before lunchtime. The comms team earned their salary that day. " +
        "The press coverage was immediate and extensive.",
      conditional_narrative: [
        {
          condition: 'breach_depth === contained',
          snippet: " The breach turned out to be minor. The market announcement looked like an overreaction. " +
            "The share price dropped 4% on the announcement and recovered 3% the next day " +
            "when the 'contained, no material impact' update went out. " +
            "The CEO asked why you'd issued a market announcement for a pricing feed issue. " +
            "It was a fair question.",
        },
        {
          condition: 'breach_depth === deep',
          snippet: " When the full scope emerged, your early disclosure looked like exactly the right call. " +
            "Competitors who'd been affected by the same Meridian compromise hadn't disclosed. " +
            "Two of them were subsequently criticised by the FCA. " +
            "You were cited as an example of best practice. Duncan's team received an industry award. " +
            "Tomasz was interviewed by Cyber Security Weekly and appeared to enjoy it enormously.",
        },
      ],
      compounding_effects: [
        { key: 'cyber_response', value: 'full_public' },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
  ],
  preconditions: [
    {
      key: 'systems_funded',
      option_modifiers: [
        {
          option_id: 'cyber_opt3',
          consequence_adjustments: { cumulative_pnl: 2 },
          narrative_override:
            "You gave Duncan seventy-two hours. The modernised systems meant he needed only thirty-six. " +
            "His team traced every compromised price through every downstream system with forensic precision. " +
            "Tomasz, working alongside Duncan, turned out to be a natural at incident response. " +
            "The CTO allowed himself a small smile.",
        },
      ],
    },
  ],
};
