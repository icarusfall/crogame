const BASE = process.argv[2] || 'https://crogame.up.railway.app';

async function run() {
  console.log(`Testing against ${BASE}\n`);

  // Create session
  const createRes = await fetch(`${BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_name: 'E2E Test', strategy: 'guardian' }),
  });
  const session = await createRes.json();
  const sid = session.session_id;
  let opt = session.scenario.options[0].id;
  console.log('Session:', sid);
  console.log('First scenario:', session.scenario.title);

  // Play through picking first option each time
  for (let i = 1; i <= 15; i++) {
    const res = await fetch(`${BASE}/api/sessions/${sid}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_id: opt }),
    });
    const data = await res.json();
    console.log(`Decision ${i}: game_over=${data.is_game_over}`);
    if (data.is_game_over) break;
    opt = data.next_scenario.options[0].id;
  }

  // Report
  const reportRes = await fetch(`${BASE}/api/sessions/${sid}/report`);
  const r = await reportRes.json();
  console.log('\n=== REPORT ===');
  console.log(`Status: ${r.status}`);
  console.log(`Title: ${r.tenure_title}`);
  console.log(`Solvency: ${r.scores.solvency_ratio}%`);
  console.log(`P&L: £${r.scores.cumulative_pnl}m`);
  console.log(`Reputation: ${r.scores.reputation}/100`);
  console.log(`Board: ${r.scores.board_confidence}/100`);
  console.log(`Regulatory: ${r.scores.regulatory_standing}`);
  console.log(`Decisions: ${r.decisions.length}`);

  // Leaderboard
  const lbRes = await fetch(`${BASE}/api/leaderboard`);
  const lb = await lbRes.json();
  console.log('\n=== LEADERBOARD ===');
  for (const e of lb.rankings) {
    console.log(`${e.player_name} | ${e.tenure_title} | ${e.strategy} | score=${e.composite_score.toFixed(1)}`);
  }

  console.log('\n✓ E2E test complete');
}

run().catch(err => {
  console.error('E2E test failed:', err);
  process.exit(1);
});
