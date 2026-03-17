import type { Scenario } from '../../types/scenario.js';

export const ftJournalist: Scenario = {
  id: 'ft_journalist',
  title: 'The FT Journalist',
  category: 'curveball',
  division: 'group',
  year_range: [2, 4],
  is_tentpole: false,
  illustration_key: 'scene_boardroom',
  setup_text:
    "Your Head of Communications has forwarded an email with a single-word subject line: 'Trouble.'\n\n" +
    "The email is from a Financial Times journalist called Sarah Chen. She's been on the insurance beat " +
    "for three years and has a reputation for being thorough, fair, and absolutely relentless. " +
    "She is writing a long-form piece on risk management at major UK insurers. She would like to " +
    "interview you. She has some specific questions.\n\n" +
    "Your Head of Communications has done some reconnaissance. Chen has been calling former employees, " +
    "consultants, and PRA contacts. She has FOI'd some supervisory correspondence. " +
    "She appears to know more about your firm than some of your board members, which is admittedly " +
    "a low bar.\n\n" +
    "'The question,' says your Head of Comms, 'is whether we want to be in this story or not. " +
    "Because she's writing it either way.'\n\n" +
    "Your General Counsel has views. They are predictable.",
  random_params: {
    // How much information Chen has actually obtained vs is bluffing about
    journalist_intel: {
      type: 'discrete',
      outcomes: [
        { value: 'surface', weight: 2 },    // ~40% — mostly public info, fishing for quotes
        { value: 'informed', weight: 2 },    // ~40% — has genuine sources, knows the broad picture
        { value: 'deep', weight: 1 },         // ~20% — ex-employee source, knows specifics
      ],
    },
  },
  options: [
    {
      id: 'ft_journalist_opt1',
      label: 'Give the full interview — on the record, no restrictions',
      description:
        "Sit down with Chen. Answer everything. On the record. Show you have nothing to hide. " +
        "Risk: journalists are very good at getting you to say things you didn't intend to say. " +
        "One loose phrase becomes a headline.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 3,
        board_confidence: -3,
        reputation: 3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If you're genuinely clean, this goes well
        {
          condition: 'conservative_choices_count >= 4',
          impact: { reputation: 10, board_confidence: 5 },
        },
        // Goldman trader — she'll ask about him specifically
        {
          condition: 'yield_grab_goldman_trader === true',
          impact: { reputation: -8, board_confidence: -3 },
        },
        // Fund suspension — she wants the story behind the headline
        {
          condition: 'sam_funds_suspended === true',
          impact: { reputation: -5 },
        },
        // Held marks artificially — if she has deep intel, this is dangerous
        {
          condition: 'marks_held_artificially === true',
          impact: { reputation: -5, board_confidence: -3 },
        },
        // Deep intel journalist gets more out of you in person
        {
          condition: 'journalist_intel === deep',
          impact: { reputation: -5, board_confidence: -5 },
        },
        // Surface-level journalist — your candour impresses
        {
          condition: 'journalist_intel === surface',
          impact: { reputation: 5, board_confidence: 2 },
        },
        // If you've had the formal memo filed against you, she might have it
        {
          condition: 'formal_memo_filed === true',
          impact: { reputation: -3 },
        },
        // Hidden discrepancies — you might accidentally reference them
        {
          condition: 'four_pct_hidden_discrepancies === true',
          impact: { reputation: -5, regulatory_standing: 1 },
        },
      ],
      narrative_snippet:
        "You gave the interview. Ninety minutes in a meeting room with Sarah Chen, your Head of Comms " +
        "taking notes in the corner with the fixed smile of someone watching a controlled detonation.",
      conditional_narrative: [
        {
          condition: 'conservative_choices_count >= 4',
          snippet: " Chen wrote a profile titled 'The Quiet CRO.' It was, against all odds, complimentary. " +
            "'In an industry of cowboys,' she wrote, 'one executive is making a career out of saying no.' " +
            "The CEO wasn't sure whether this was good PR or a devastating insult. You chose to take the compliment.",
        },
        {
          condition: 'yield_grab_goldman_trader === true',
          snippet: " She asked about the Goldman trader by name. She knew his previous employer, his compensation " +
            "package, and his concentrated positions. You answered carefully. " +
            "The article used the phrase 'aggressive hiring decisions' in a paragraph that did not feel admiring.",
        },
        {
          condition: 'journalist_intel === deep',
          snippet: " Chen knew things that weren't public. She had clearly spoken to someone inside the building. " +
            "Your Head of Comms spent the following week trying to identify the source. " +
            "They never did.",
        },
        {
          condition: 'four_pct_hidden_discrepancies === true',
          snippet: " You mentioned the Four Percent Problem remediation. She asked a follow-up question " +
            "about the second error. You paused a beat too long. In print, the pause became " +
            "'the CRO was unable to confirm whether all affected policies had been fully corrected.'",
        },
      ],
      compounding_effects: [
        { key: 'ft_response', value: 'full_interview' },
        { key: 'ft_story_published', value: true },
      ],
      strategy_alignment: 'growth',
    },
    {
      id: 'ft_journalist_opt2',
      label: 'Decline to comment',
      description:
        "Standard legal advice. Say nothing. 'Steadfast declined to comment.' " +
        "Safe from self-inflicted wounds, but Chen writes the story without your input. " +
        "If she has the wrong end of the stick, you can't correct her. " +
        "If she has the right end, 'declined to comment' confirms it.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: 2,
        reputation: -5,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // If clean — declining to comment on a nothing story looks paranoid
        {
          condition: 'conservative_choices_count >= 4',
          impact: { reputation: -8, board_confidence: -3 },
        },
        // Journalist with surface intel — she fills the gaps with speculation
        {
          condition: 'journalist_intel === surface',
          impact: { reputation: -10, board_confidence: -5 },
        },
        // Journalist with deep intel — she publishes what she has, unchallenged
        {
          condition: 'journalist_intel === deep',
          impact: { reputation: -8, board_confidence: -3 },
        },
        // Goldman trader — she runs the trader story without context
        {
          condition: 'yield_grab_goldman_trader === true',
          impact: { reputation: -10, board_confidence: -5 },
        },
        // Fund suspension — 'declined to comment' on a fund suspension is devastating
        {
          condition: 'sam_funds_suspended === true',
          impact: { reputation: -8, board_confidence: -3 },
        },
        // Marks held — the perception problem becomes worse unchallenged
        {
          condition: 'marks_held_artificially === true',
          impact: { reputation: -8, regulatory_standing: 1 },
        },
        // The self-fulfilling prophecy: if she writes about fund concerns without your input,
        // investors panic based on the article
        {
          condition: 'bulk_annuity_private_assets === true',
          impact: { reputation: -5, cumulative_pnl: -5 },
        },
      ],
      narrative_snippet:
        "You declined to comment. Your General Counsel approved. Your Head of Comms did not.\n\n" +
        "'Steadfast Group declined to comment on the specific questions raised in this article,' " +
        "Chen wrote. It appeared in the third paragraph. In journalism, the third paragraph " +
        "is where guilt lives.",
      conditional_narrative: [
        {
          condition: 'journalist_intel === surface',
          snippet: " Chen didn't actually have much. But without your side of the story, " +
            "she filled the gaps with 'sources close to the situation' and 'industry observers.' " +
            "The resulting article implied problems that didn't exist. " +
            "Two institutional investors called your Head of Institutional Retirement " +
            "to ask if they should be worried. By the time you'd said 'no,' the damage was done.",
        },
        {
          condition: 'conservative_choices_count >= 4',
          snippet: " You had nothing to hide and declined to comment anyway. " +
            "The article was mildly negative — not because Chen had found anything, " +
            "but because silence invites interpretation. 'Why won't they talk?' " +
            "a consultant asked on Twitter. It was a good question.",
        },
        {
          condition: 'yield_grab_goldman_trader === true',
          snippet: " Chen ran the Goldman trader story without context. " +
            "'Steadfast hires aggressive prop trader, CRO declines to comment' was not " +
            "the headline your board wanted to read over breakfast. The trader himself " +
            "was furious. He threatened to sue the FT. Your General Counsel talked him down. " +
            "The Head of Internal Ratings read the article twice and saved a copy.",
        },
        {
          condition: 'marks_held_artificially === true',
          snippet: " The article questioned Steadfast's private credit valuations in detail. " +
            "Without your input, Chen relied on three anonymous fund managers who all said the same thing: " +
            "'If the marks are right, why won't they discuss them?' " +
            "Two pension scheme clients called the next morning to discuss their exposure.",
        },
        {
          condition: 'sam_funds_suspended === true',
          snippet: " 'Steadfast, which suspended its private credit funds earlier this year, " +
            "declined to comment on questions about its risk management practices.' " +
            "The sentence was perfectly factual and completely devastating.",
        },
      ],
      compounding_effects: [
        { key: 'ft_response', value: 'declined_comment' },
        { key: 'ft_story_published', value: true },
        { key: 'ft_perception_worse_than_reality', value: true },
      ],
      strategy_alignment: 'conservative',
    },
    {
      id: 'ft_journalist_opt3',
      label: 'Background only — off the record, steer the narrative',
      description:
        "Meet Chen informally. Everything off the record. Guide her towards the positive story, " +
        "contextualise the negative. Sophisticated media management. " +
        "Risk: 'off the record' is a convention, not a law.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 5,
        board_confidence: 0,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Clean player — background works well, shapes a positive narrative
        {
          condition: 'conservative_choices_count >= 4',
          impact: { reputation: 8, board_confidence: 3 },
        },
        // Moderate skeletons — background helps contextualise
        {
          condition: 'yield_grab_goldman_trader === true',
          impact: { reputation: -3 }, // can spin it but not eliminate it
        },
        // Deep intel journalist — she already knows more than you think
        {
          condition: 'journalist_intel === deep',
          impact: { reputation: -5, board_confidence: -3 },
        },
        // Surface intel — your background steers the story significantly
        {
          condition: 'journalist_intel === surface',
          impact: { reputation: 5, board_confidence: 3 },
        },
        // Hidden discrepancies — risk of accidentally confirming something
        {
          condition: 'four_pct_hidden_discrepancies === true',
          impact: { reputation: -3 },
        },
        // Informed journalist — fair exchange, reasonable outcome
        {
          condition: 'journalist_intel === informed',
          impact: { reputation: 2 },
        },
      ],
      narrative_snippet:
        "You met Chen off the record in a coffee shop that your Head of Comms insisted was 'discreet,' " +
        "despite being three hundred metres from the FT's office. You talked for an hour. " +
        "You shaped the narrative where you could and conceded ground where you had to.",
      conditional_narrative: [
        {
          condition: 'journalist_intel === deep',
          snippet: " Chen knew more than you'd expected. The background conversation became less about " +
            "steering and more about damage limitation. She listened carefully, asked precise follow-up " +
            "questions, and at one point said 'that's not what I've been told' in a tone that " +
            "ended a line of argument permanently. You left the coffee shop less confident than " +
            "when you'd arrived.",
        },
        {
          condition: 'journalist_intel === surface',
          snippet: " Chen was fishing. She had less than she'd implied. Your background briefing " +
            "gave her context that shifted the piece from 'investigation' to 'profile.' " +
            "The resulting article was balanced. Your Head of Comms called it a win. " +
            "Your General Counsel called it 'acceptable,' which from a lawyer is rapturous praise.",
        },
        {
          condition: 'conservative_choices_count >= 4',
          snippet: " You had a good story to tell and you told it well. Chen wrote a piece about " +
            "the tension between prudence and growth in the insurance sector. Steadfast featured as " +
            "the cautious counterpoint. It was almost flattering.",
        },
      ],
      compounding_effects: [
        { key: 'ft_response', value: 'background_only' },
        { key: 'ft_story_published', value: true },
      ],
      strategy_alignment: 'balanced',
    },
    {
      id: 'ft_journalist_opt4',
      label: "Pre-empt — publish your own thought leadership piece first",
      description:
        "Get ahead of the story. Write an op-ed or give a keynote on risk management. " +
        "Set the narrative before Chen does. Requires saying something interesting enough " +
        "to be newsworthy. Risk: draws more attention to the firm at exactly the wrong moment.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: -2,
        reputation: 3,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Clean player — genuine thought leadership
        {
          condition: 'conservative_choices_count >= 4',
          impact: { reputation: 12, board_confidence: 5 },
        },
        // Goldman trader — pre-empting draws attention to the thing you don't want attention on
        {
          condition: 'yield_grab_goldman_trader === true',
          impact: { reputation: -5, board_confidence: -3 },
        },
        // Deep intel — Chen uses your public statements against your private actions
        {
          condition: 'journalist_intel === deep',
          impact: { reputation: -10, board_confidence: -5 },
        },
        // Fund suspension — hard to thought-lead through a crisis
        {
          condition: 'sam_funds_suspended === true',
          impact: { reputation: -8, board_confidence: -5 },
        },
        // Systems funded — can credibly talk about operational investment
        {
          condition: 'systems_funded === true',
          impact: { reputation: 5 },
        },
        // Marks held artificially — public statements about risk management
        // vs private decisions on marks creates a contrast
        {
          condition: 'marks_held_artificially === true',
          impact: { reputation: -8, regulatory_standing: 1 },
        },
      ],
      narrative_snippet:
        "You wrote an op-ed for Insurance Risk Magazine titled 'The Courage of Conservatism: " +
        "Why Risk Officers Must Say No.' Your Head of Comms placed it before Chen's article ran.",
      conditional_narrative: [
        {
          condition: 'conservative_choices_count >= 4',
          snippet: " The op-ed landed well. You believed what you'd written because you'd lived it. " +
            "Chen read it and adjusted her piece. 'The CRO who practises what they preach' appeared " +
            "in the final article. Three headhunters called. The CEO suggested you might be " +
            "'attracting a bit too much personal profile,' which is CEO for 'I'm slightly threatened.'",
        },
        {
          condition: 'journalist_intel === deep',
          snippet: " Chen read your op-ed with professional interest. Then she ran her article alongside it. " +
            "'In a recent op-ed,' she wrote, 'the Steadfast CRO argued for conservative risk management. " +
            "The firm's actual decisions tell a more complicated story.' " +
            "The contrast was surgically precise. Your Head of Comms stopped returning calls for two days.",
        },
        {
          condition: 'marks_held_artificially === true',
          snippet: " Writing publicly about prudent risk management while privately holding stale marks " +
            "created what your General Counsel called 'an unhelpful juxtaposition.' " +
            "Chen's article quoted your op-ed and then detailed the marking inconsistencies " +
            "in the next paragraph. The word 'hypocrisy' was not used. It did not need to be.",
        },
      ],
      compounding_effects: [
        { key: 'ft_response', value: 'pre_empt' },
        { key: 'ft_story_published', value: true },
        { key: 'public_profile_raised', value: true },
      ],
      strategy_alignment: 'growth',
    },
    {
      id: 'ft_journalist_opt5',
      label: 'Have your CEO call her editor',
      description:
        "The nuclear option. Your CEO plays golf with people who sit on the FT's advisory board. " +
        "A call is made. The article is delayed, softened, or spiked. " +
        "Works in the short term. If it ever comes out that you tried to kill the story, " +
        "the follow-up article will be significantly worse.",
      consequences: {
        solvency_ratio: 0,
        cumulative_pnl: 0,
        board_confidence: 5,
        reputation: 0,
        regulatory_standing: 0,
      },
      conditional_consequences: [
        // Low intel — the story gets spiked, nobody notices
        {
          condition: 'journalist_intel === surface',
          impact: { reputation: 2, board_confidence: 3 },
        },
        // Deep intel — Chen is furious and comes back harder
        {
          condition: 'journalist_intel === deep',
          impact: { reputation: -15, board_confidence: -10, regulatory_standing: 1 },
        },
        // Informed journalist — 50/50 whether it works
        {
          condition: 'journalist_intel === informed',
          impact: { reputation: -5, board_confidence: -2 },
        },
        // Goldman trader — Chen knows, and killing the story confirms
        {
          condition: 'yield_grab_goldman_trader === true',
          impact: { reputation: -8 },
        },
        // Fund suspension — too public to bury
        {
          condition: 'sam_funds_suspended === true',
          impact: { reputation: -10, board_confidence: -5 },
        },
      ],
      narrative_snippet:
        "Your CEO made a phone call. The article was 'deprioritised.' " +
        "For three weeks, nothing happened. Your Head of Comms looked cautiously optimistic.",
      conditional_narrative: [
        {
          condition: 'journalist_intel === deep',
          snippet: " Chen found out. Journalists always find out. She went to her editor with the original " +
            "article plus a new angle: 'Major insurer attempts to suppress FT investigation.' " +
            "The follow-up piece ran on the front page. It was longer, angrier, and more detailed " +
            "than the original would have been. Your CEO stopped returning your calls for a week. " +
            "The phrase 'Streisand Effect' was used at the next board meeting, by a non-executive " +
            "who looked like he'd been waiting years to deploy it.",
        },
        {
          condition: 'journalist_intel === surface',
          snippet: " The story went away. Chen moved on to another investigation. " +
            "Your CEO was pleased. Your Head of Comms was relieved. " +
            "Your General Counsel said nothing, which meant she was filing this under " +
            "'things that may come back to haunt us.'",
        },
        {
          condition: 'journalist_intel === informed',
          snippet: " The article ran anyway, two weeks later, in a slightly different form. " +
            "Chen hadn't been told directly, but she'd noticed the delay and drawn conclusions. " +
            "The piece included the line 'this newspaper encountered unusual resistance " +
            "in reporting this story.' It was the most damaging sentence in the article.",
        },
      ],
      compounding_effects: [
        { key: 'ft_response', value: 'kill_story' },
        { key: 'ft_story_suppressed', value: true },
        { key: 'ft_story_published', value: true },
      ],
      strategy_alignment: 'aggressive',
    },
  ],
  preconditions: [
    {
      key: 'yield_grab_goldman_trader',
      setup_text_modifier:
        "Your Head of Communications has forwarded an email with a single-word subject line: 'Trouble.'\n\n" +
        "The email is from a Financial Times journalist called Sarah Chen. She's been on the insurance beat " +
        "for three years and has a reputation for being thorough, fair, and absolutely relentless. " +
        "She is writing a piece about 'aggressive hiring practices in the insurance sector' and has " +
        "specific questions about a trader recently hired from Goldman Sachs. She names him. " +
        "She knows his compensation. She appears to have spoken to someone at his previous employer.\n\n" +
        "Your Head of Communications has done some reconnaissance. Chen has been calling former employees, " +
        "consultants, and PRA contacts. She has FOI'd some supervisory correspondence. " +
        "She appears to know more about your firm than some of your board members, which is admittedly " +
        "a low bar.\n\n" +
        "'The question,' says your Head of Comms, 'is whether we want to be in this story or not. " +
        "Because she's writing it either way.'\n\n" +
        "The Goldman trader, who has been told about the inquiry, has suggested suing the Financial Times. " +
        "Your General Counsel has suggested he sit down and be quiet.",
    },
    {
      key: 'sam_funds_suspended',
      setup_text_modifier:
        "Your Head of Communications has forwarded an email with a single-word subject line: 'Trouble.'\n\n" +
        "The email is from a Financial Times journalist called Sarah Chen. She's been on the insurance beat " +
        "for three years and has a reputation for being thorough, fair, and absolutely relentless. " +
        "She is writing a follow-up piece on the private credit market disruption and wants to understand " +
        "why Steadfast suspended its funds. She has specific questions about the valuation methodology, " +
        "the timing of the suspension, and whether the balance sheet marks are consistent with the fund marks.\n\n" +
        "Your Head of Communications has done some reconnaissance. Chen has been calling former employees, " +
        "consultants, and PRA contacts. She has spoken to at least two investors who were locked in " +
        "by the suspension. They were not complimentary.\n\n" +
        "'The question,' says your Head of Comms, 'is whether we want to be in this story or not. " +
        "Because she's writing it either way. And right now, the only voices in it are angry investors.'\n\n" +
        "Your General Counsel has cleared her afternoon.",
    },
  ],
};
