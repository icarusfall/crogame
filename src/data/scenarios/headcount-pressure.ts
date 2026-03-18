import type { Scenario } from '../../types/scenario.js';

export const headcountPressure: Scenario = {
  id: 'headcount_pressure',
  title: 'The 15% Cut',
  category: 'operational',
  division: 'group',
  year_range: [2, 4],
  is_tentpole: false,
  illustration_key: 'headcount_pressure',
  setup_text:
    "The group CEO has sent an email to all executive committee members. The subject line is " +
    "'Operational Efficiency Programme.' This is how CEOs say 'redundancies.'\n\n" +
    "Every support function must reduce headcount by 15%. No exceptions. The CFO has modelled the savings. " +
    "The HR director has drafted a timeline. The CEO has called it 'right-sizing for the future.' " +
    "Your team calls it 'being asked to do the same job with fewer people in the middle of the most " +
    "demanding regulatory environment in living memory.'\n\n" +
    "You have a team of forty-five. Fifteen percent is seven people.\n\n" +
    "Your best model validator is Priya Sharma. She has been at the firm for eighteen months. " +
    "She is quiet, meticulous, and routinely catches errors that nobody else sees. She has just " +
    "returned from maternity leave. Under a 'last in, first out' approach, she would be one of " +
    "the first to go.\n\n" +
    "Your most political team member is a man called Richard, who has been here for twelve years, " +
    "plays golf with two non-executive directors, and produces work of a quality that could " +
    "charitably be described as 'adequate.' Under any competence-based criterion, he would be first. " +
    "Under LIFO, he is untouchable.\n\n" +
    "Your Head of Risk Operations catches your eye across the room. She knows what you're thinking. " +
    "She is thinking it too.",
  random_params: {
    // Whether a major model error occurs after the cuts (connects to model failure scenario)
    post_cut_incident: { type: 'bernoulli', probability: 0.35 },
  },
  options: [
    {
      id: 'headcount_opt1',
      label: 'Accept the 15% — use competence-based criteria, keep Priya',
      description:
        "Apply performance-based selection. The best people stay regardless of tenure. " +
        "Richard goes. He will not go quietly. Two NEDs will receive phone calls.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 3,
        board_confidence: -3,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'post_cut_incident === true',
          impact: { reputation: -3, board_confidence: -3 },
        },
      ],
      narrative_snippet:
        "You applied competence-based criteria. Priya stayed. Richard did not. " +
        "The HR director supported your rationale. The two non-executive directors who played golf " +
        "with Richard did not. There were calls. There were 'informal concerns raised at board level.' " +
        "Your Head of Risk Operations told you it was the right decision. " +
        "She was correct. It did not feel like it at the time.",
      conditional_narrative: [
        {
          condition: 'post_cut_incident === true',
          snippet: " Six months later, a model validation issue surfaced. Priya caught it. " +
            "If she hadn't been there, it would have been caught much later — if at all. " +
            "Nobody connected this to the headcount decision. Nobody needed to.",
        },
      ],
      compounding_effects: [
        { key: 'headcount_response', value: 'competence_based' },
        { key: 'priya_retained', value: true },
        { key: 'richard_removed', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'headcount_opt2',
      label: 'Accept the 15% — use LIFO, lose Priya',
      description:
        "Last in, first out. Legally cleaner, politically easier. " +
        "Richard stays. Priya goes. The model validation capability takes a significant hit.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 3,
        board_confidence: 3,
        reputation: -3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Post-cut incident without Priya is much worse
        {
          condition: 'post_cut_incident === true',
          impact: { solvency_ratio: -3, cumulative_pnl: -5, regulatory_standing: 1, board_confidence: -5 },
        },
      ],
      narrative_snippet:
        "You used LIFO. Priya was made redundant four months after returning from maternity leave. " +
        "She cried in the meeting room. Your HR director handled it professionally. " +
        "Richard continued to play golf with the non-executive directors. His work continued to be adequate. " +
        "The model validation team went from excellent to competent, which sounds acceptable " +
        "until you remember that 'competent' means 'probably catches most of the errors, probably.'",
      conditional_narrative: [
        {
          condition: 'post_cut_incident === true',
          snippet: " Eight months later, a model validation issue went undetected for three weeks. " +
            "The person who would have caught it in the first hour was working at a competitor, " +
            "where she had been immediately promoted. The error cost £5m to remediate. " +
            "Richard was not involved in the remediation. Richard was at a golf day.",
        },
      ],
      compounding_effects: [
        { key: 'headcount_response', value: 'lifo' },
        { key: 'priya_retained', value: false },
        { key: 'model_validation_weakened', value: true },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'headcount_opt3',
      label: 'Fight the cuts — risk is not a support function',
      description:
        "Push back on the CEO. Argue that risk is a regulated function with PRA-mandated responsibilities. " +
        "Cutting 15% puts the firm in breach of its own risk management framework. " +
        "Bold, principled, and guaranteed to make you unpopular.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 3,
        board_confidence: -10,
        reputation: 5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'conservative_choices_count >= 3',
          impact: { board_confidence: -5 },
        },
        // Post-cut incident vindicates you
        {
          condition: 'post_cut_incident === true',
          impact: { board_confidence: 5, reputation: 5 },
        },
      ],
      narrative_snippet:
        "You told the CEO that risk was not a support function and that a 15% cut would put the firm " +
        "in breach of its own risk management framework. You cited PRA supervisory statement SS1/15. " +
        "You cited the Senior Managers Regime. You cited the board's own risk appetite statement, " +
        "paragraph seven, clause three.\n\n" +
        "The CEO listened, and then explained that every function head had said essentially the same thing " +
        "and that if she exempted everyone who cited a regulation, nobody would be cut. " +
        "'You're not special,' she said. 'Your function is.' " +
        "You got a three-month reprieve. Then the cuts happened anyway, at 10%.",
      compounding_effects: [
        { key: 'headcount_response', value: 'fought_cuts' },
        { key: 'priya_retained', value: true },
        { key: 'ceo_relationship_strained', value: true },
        { key: 'conservative_choices_count', value: 1 },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'headcount_opt4',
      label: 'Counter-propose — cut 4 heads and automate monitoring functions',
      description:
        "Offer a smaller reduction offset by technology investment in automated risk monitoring. " +
        "Saves money long-term, keeps key people, but requires upfront spend. " +
        "The CEO wanted savings now, not investment cases.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 2,
        board_confidence: -2,
        reputation: 2,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        {
          condition: 'systems_funded === true',
          impact: { board_confidence: 3, cumulative_pnl: 3 },
        },
        {
          condition: 'systems_funded !== true',
          impact: { board_confidence: -3, cumulative_pnl: -3 },
        },
        {
          condition: 'post_cut_incident === true',
          impact: { board_confidence: 2, reputation: 3 },
        },
      ],
      narrative_snippet:
        "You proposed cutting four and investing in automation. The CEO looked at your business case " +
        "with the expression of someone who had asked for savings and been handed an investment proposal. " +
        "'You want me to spend money to save money,' she said. 'Eventually,' you confirmed. " +
        "She approved it, reluctantly, on the condition that the remaining three cuts came from natural attrition " +
        "within twelve months. Priya stayed. Richard stayed too, but was reassigned to a role that " +
        "involved fewer spreadsheets and more 'stakeholder engagement,' which meant he continued " +
        "playing golf but was no longer responsible for anything quantitative.",
      conditional_narrative: [
        {
          condition: 'systems_funded === true',
          snippet: " The automation was built on top of the modernised platform, which made it considerably " +
            "faster and cheaper to implement. The CTO's team delivered the risk dashboards in eight weeks. " +
            "The monitoring that had previously required three full-time analysts was automated to the point " +
            "where one person could do it. The business case worked.",
        },
        {
          condition: 'systems_funded !== true',
          snippet: " Building automation on top of the legacy platform was like fitting a Tesla engine " +
            "to a horse and cart. The project took six months, cost twice the estimate, and produced " +
            "dashboards that were technically functional but required Janet's spreadsheets as an input. " +
            "The CEO asked whether the automation had actually saved any money. " +
            "The answer was: not yet.",
        },
      ],
      compounding_effects: [
        { key: 'headcount_response', value: 'counter_propose' },
        { key: 'priya_retained', value: true },
        { key: 'risk_automation_started', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'headcount_opt5',
      label: 'Volunteer deeper cuts — offer 20% to build political capital',
      description:
        "Go further than asked. Offer to cut 20% of the risk team. " +
        "The CEO will remember this when you need something. " +
        "Your team will remember it too, differently.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 5,
        board_confidence: 3,
        reputation: -5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Post-cut incident is devastating with a 20% reduced team
        {
          condition: 'post_cut_incident === true',
          impact: { solvency_ratio: -5, cumulative_pnl: -10, regulatory_standing: 1, board_confidence: -18, reputation: -10 },
        },
      ],
      narrative_snippet:
        "You offered 20%. Nine people instead of seven. The CEO was visibly surprised. " +
        "'That's very... constructive,' she said. Your Head of Risk Operations stared at you " +
        "with an expression that communicated several things simultaneously, none of them positive. " +
        "Priya went. Richard went. Five others went. Your remaining team of thirty-six looked around " +
        "the depleted floor and updated their CVs.",
      conditional_narrative: [
        {
          condition: 'post_cut_incident === true',
          snippet: " The incident, when it came, hit a team that was already stretched to breaking point. " +
            "The response took twice as long as it should have. Two critical deadlines were missed. " +
            "The PRA noted that the risk function appeared 'under-resourced relative to the complexity " +
            "of the firm's activities.' The CEO did not connect this observation to the headcount decision. " +
            "Everyone else did.",
        },
      ],
      compounding_effects: [
        { key: 'headcount_response', value: 'deeper_cuts' },
        { key: 'priya_retained', value: false },
        { key: 'model_validation_weakened', value: true },
        { key: 'risk_team_understaffed', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
  ],
  preconditions: [],
};
