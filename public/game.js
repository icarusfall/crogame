// === Be the CRO — Client-side Game Logic ===

const API = '';  // Same origin

// Game state
let sessionId = null;
let currentScenario = null;
let scores = null;
let decisionCount = 0;
let selectedOptionId = null;
let pendingSubChoices = null;

// === SCREEN MANAGEMENT ===
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  screen.classList.add('active');
  window.scrollTo(0, 0);
}

// === WELCOME SCREEN ===
const nameInput = document.getElementById('player-name');
const startBtn = document.getElementById('btn-start');
const strategyCards = document.querySelectorAll('.strategy-card');
let selectedStrategy = null;

function updateStartButton() {
  startBtn.disabled = !(nameInput.value.trim() && selectedStrategy);
}

nameInput.addEventListener('input', updateStartButton);

strategyCards.forEach(card => {
  card.addEventListener('click', () => {
    strategyCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedStrategy = card.dataset.strategy;
    updateStartButton();
  });
});

startBtn.addEventListener('click', async () => {
  if (startBtn.disabled) return;
  startBtn.disabled = true;
  startBtn.textContent = 'Starting...';

  try {
    const res = await fetch(`${API}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_name: nameInput.value.trim(),
        strategy: selectedStrategy,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to create session');

    sessionId = data.session_id;
    scores = data.scores;
    decisionCount = 0;
    currentScenario = data.scenario;

    renderScenario();
    showScreen('screen-scenario');
  } catch (err) {
    alert('Failed to start game: ' + err.message);
    startBtn.disabled = false;
    startBtn.textContent = 'Begin Your Tenure';
  }
});

// === SCORE RENDERING ===
function updateScores(newScores, impacts) {
  scores = newScores;

  const solvencyEl = document.getElementById('score-solvency');
  const pnlEl = document.getElementById('score-pnl');
  const regEl = document.getElementById('score-regulatory');
  const repEl = document.getElementById('score-reputation');
  const boardEl = document.getElementById('score-board');

  solvencyEl.textContent = `${scores.solvency_ratio}%`;
  pnlEl.textContent = `\u00A3${scores.cumulative_pnl}m`;
  regEl.innerHTML = `<span class="reg-dot ${scores.regulatory_standing}"></span> ${capitalize(scores.regulatory_standing)}`;
  repEl.textContent = scores.reputation;
  boardEl.textContent = scores.board_confidence;

  // Flash changed scores
  if (impacts) {
    flashScore(solvencyEl, impacts.solvency_ratio);
    flashScore(pnlEl, impacts.cumulative_pnl);
    flashScore(repEl, impacts.reputation);
    flashScore(boardEl, impacts.board_confidence);
  }
}

function flashScore(el, change) {
  if (!change || change === 0) return;
  const cls = change > 0 ? 'flash-positive' : 'flash-negative';
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 1500);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Score toggle
document.getElementById('btn-toggle-scores').addEventListener('click', () => {
  document.getElementById('score-dashboard').classList.toggle('collapsed');
});

// === SCENARIO RENDERING ===
function renderScenario() {
  decisionCount++;
  const s = currentScenario;

  document.getElementById('scenario-year').textContent = `Year ${s.year}`;
  document.getElementById('outcome-year').textContent = `Year ${s.year}`;
  document.getElementById('decision-counter').textContent = `Decision ${decisionCount} of 10`;
  document.getElementById('scenario-title').textContent = s.title;
  document.getElementById('scenario-category').textContent = s.category;
  document.getElementById('scenario-division').textContent = s.division;
  document.getElementById('scenario-text').textContent = s.setup_text;

  // Set illustration
  const img = document.getElementById('scenario-image');
  img.classList.remove('loaded');
  img.src = `/images/${s.illustration_key}.webp`;
  img.alt = s.title;
  img.onload = () => img.classList.add('loaded');

  updateScores(scores);

  // Render options
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  selectedOptionId = null;

  s.options.forEach(opt => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.dataset.optionId = opt.id;

    card.innerHTML = `
      <span class="option-label">${opt.label}</span>
      <span class="option-description">${opt.description}</span>
      <button class="option-confirm">Confirm Decision</button>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('option-confirm')) return;
      // Select this card
      container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedOptionId = opt.id;
    });

    // Confirm button
    card.querySelector('.option-confirm').addEventListener('click', () => {
      if (opt.sub_choices && opt.sub_choices.length > 0) {
        showSubChoices(opt);
      } else {
        submitDecision(opt.id);
      }
    });

    container.appendChild(card);
  });
}

// === SUB-CHOICES ===
function showSubChoices(option) {
  pendingSubChoices = option;
  const overlay = document.getElementById('subchoice-overlay');
  const title = document.getElementById('subchoice-title');
  const container = document.getElementById('subchoice-options');

  title.textContent = option.label;
  container.innerHTML = '';

  option.sub_choices.forEach(sc => {
    const card = document.createElement('div');
    card.className = 'subchoice-card';
    card.innerHTML = `
      <span class="subchoice-label">${sc.label}</span>
      <span class="subchoice-desc">${sc.description}</span>
    `;
    card.addEventListener('click', () => {
      overlay.classList.add('hidden');
      submitDecision(option.id, sc.id);
    });
    container.appendChild(card);
  });

  overlay.classList.remove('hidden');
}

document.getElementById('btn-subchoice-back').addEventListener('click', () => {
  document.getElementById('subchoice-overlay').classList.add('hidden');
});

// === SUBMIT DECISION ===
async function submitDecision(optionId, subChoiceId) {
  // Disable all option cards
  document.querySelectorAll('.option-card').forEach(c => {
    c.style.pointerEvents = 'none';
    c.style.opacity = '0.5';
  });

  try {
    const body = { option_id: optionId };
    if (subChoiceId) body.sub_choice_id = subChoiceId;

    const res = await fetch(`${API}/api/sessions/${sessionId}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit decision');

    // Show outcome
    renderOutcome(data);
  } catch (err) {
    alert('Error: ' + err.message);
    // Re-enable options
    document.querySelectorAll('.option-card').forEach(c => {
      c.style.pointerEvents = '';
      c.style.opacity = '';
    });
  }
}

// === OUTCOME RENDERING ===
function renderOutcome(result) {
  const narrativeEl = document.getElementById('outcome-narrative');
  const changesEl = document.getElementById('score-changes');
  const interstitialSection = document.getElementById('interstitial-section');
  const interstitialText = document.getElementById('interstitial-text');

  narrativeEl.innerHTML = renderMarkdown(result.narrative_snippet);

  // Interstitial
  if (result.interstitial_narrative) {
    interstitialText.innerHTML = renderMarkdown(result.interstitial_narrative);
    interstitialSection.classList.remove('hidden');
  } else {
    interstitialSection.classList.add('hidden');
  }

  // Score changes
  changesEl.innerHTML = '';
  const impacts = result.score_impacts || {};
  const labels = {
    solvency_ratio: 'Solvency',
    cumulative_pnl: 'P&L',
    reputation: 'Reputation',
    board_confidence: 'Board',
    regulatory_standing: 'Regulatory',
  };

  for (const [key, value] of Object.entries(impacts)) {
    if (value === 0 || value === undefined) continue;

    const item = document.createElement('span');
    const isPositive = typeof value === 'number' && value > 0;
    const isNegative = typeof value === 'number' && value < 0;
    item.className = `score-change-item ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`;

    let display;
    if (key === 'regulatory_standing') {
      display = value > 0 ? '+1 flag' : '-1 flag';
    } else if (key === 'cumulative_pnl') {
      display = `${value > 0 ? '+' : ''}${value}`;
    } else {
      display = `${value > 0 ? '+' : ''}${value}`;
    }

    item.textContent = `${labels[key] || key}: ${display}`;
    changesEl.appendChild(item);
  }

  updateScores(result.scores, impacts);

  // Set up continue button
  const continueBtn = document.getElementById('btn-continue');
  if (result.is_game_over) {
    continueBtn.textContent = result.game_over_reason === 'completed' ? 'View Your Report' : 'See What Happened';
    continueBtn.onclick = () => {
      if (result.game_over_reason === 'completed') {
        loadReport();
      } else {
        showGameOver(result);
      }
    };
  } else {
    continueBtn.textContent = 'Next Decision';
    currentScenario = result.next_scenario;
    continueBtn.onclick = () => {
      renderScenario();
      showScreen('screen-scenario');
    };
  }

  showScreen('screen-outcome');
}

// === GAME OVER ===
function showGameOver(result) {
  const reasonEl = document.getElementById('gameover-reason');
  const titleEl = document.getElementById('gameover-title');
  const narrativeEl = document.getElementById('gameover-narrative');

  if (result.game_over_reason === 'fired') {
    reasonEl.textContent = 'Board Confidence Lost';
    titleEl.textContent = 'You Have Been Dismissed';
    narrativeEl.textContent = 'The board has lost confidence in your leadership. Your tenure as CRO of Steadfast Group ends here.';
  } else if (result.game_over_reason === 'insolvent') {
    reasonEl.textContent = 'Solvency Breach';
    titleEl.textContent = 'Steadfast Group Is Insolvent';
    narrativeEl.textContent = 'The firm\'s solvency ratio has fallen below regulatory minimums. The PRA has placed Steadfast Group into resolution.';
  }

  document.getElementById('btn-view-report').onclick = () => loadReport();
  showScreen('screen-gameover');
}

// === REPORT ===
async function loadReport() {
  try {
    const res = await fetch(`${API}/api/sessions/${sessionId}/report`);
    const report = await res.json();
    if (!res.ok) throw new Error(report.error || 'Failed to load report');
    renderReport(report);
  } catch (err) {
    alert('Failed to load report: ' + err.message);
  }
}

function renderReport(report) {
  document.getElementById('report-title').textContent = report.tenure_title;
  document.getElementById('report-player').textContent = report.player_name;

  const strategyLabels = {
    guardian: 'The Guardian',
    pragmatist: 'The Pragmatist',
    builder: 'The Builder',
    disruptor: 'The Disruptor',
  };
  document.getElementById('report-strategy').textContent = strategyLabels[report.strategy] || report.strategy;

  // Scores
  const scoresEl = document.getElementById('report-scores');
  const scoreData = [
    { label: 'Solvency Ratio', value: `${report.scores.solvency_ratio}%` },
    { label: 'Cumulative P&L', value: `\u00A3${report.scores.cumulative_pnl}m` },
    { label: 'Reputation', value: `${report.scores.reputation}/100` },
    { label: 'Board Confidence', value: `${report.scores.board_confidence}/100` },
    { label: 'Regulatory', value: capitalize(report.scores.regulatory_standing) },
    { label: 'Decisions Made', value: report.decisions.length },
  ];

  scoresEl.innerHTML = scoreData.map(s => `
    <div class="report-score-card">
      <span class="report-score-label">${s.label}</span>
      <span class="report-score-value">${s.value}</span>
    </div>
  `).join('');

  // Narrative
  document.getElementById('report-narrative-text').innerHTML = renderMarkdown(report.narrative);

  document.getElementById('btn-leaderboard').onclick = () => loadLeaderboard();
  document.getElementById('btn-play-again').onclick = () => resetGame();

  showScreen('screen-report');
}

// === LEADERBOARD ===
async function loadLeaderboard() {
  try {
    const [lbRes, statsRes] = await Promise.all([
      fetch(`${API}/api/leaderboard`),
      fetch(`${API}/api/leaderboard/stats`),
    ]);
    const lb = await lbRes.json();
    const stats = await statsRes.json();

    renderLeaderboard(lb.rankings, stats);
  } catch (err) {
    alert('Failed to load leaderboard: ' + err.message);
  }
}

function renderLeaderboard(rankings, stats) {
  // Stats
  const statsEl = document.getElementById('leaderboard-stats');
  statsEl.innerHTML = `
    <div class="stat-card">
      <span class="stat-value">${stats.total_sessions}</span>
      <span class="stat-label">Games Played</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${stats.completed_sessions}</span>
      <span class="stat-label">Completed</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${stats.in_progress}</span>
      <span class="stat-label">In Progress</span>
    </div>
  `;

  // Rankings table
  const tbody = document.getElementById('leaderboard-body');
  if (rankings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No completed games yet</td></tr>';
  } else {
    tbody.innerHTML = rankings.map((r, i) => `
      <tr>
        <td class="rank">${i + 1}</td>
        <td class="player-name">${escapeHtml(r.player_name)}</td>
        <td>${capitalize(r.strategy)}</td>
        <td class="title-cell">${escapeHtml(r.tenure_title)}</td>
        <td class="score-cell">${r.composite_score.toFixed(1)}</td>
      </tr>
    `).join('');
  }

  document.getElementById('btn-back-to-welcome').onclick = () => resetGame();
  showScreen('screen-leaderboard');
}

// === UTILITIES ===
function resetGame() {
  sessionId = null;
  currentScenario = null;
  scores = null;
  decisionCount = 0;
  selectedOptionId = null;
  selectedStrategy = null;
  nameInput.value = '';
  strategyCards.forEach(c => c.classList.remove('selected'));
  startBtn.disabled = true;
  startBtn.textContent = 'Begin Your Tenure';
  document.getElementById('score-dashboard').classList.add('collapsed');
  showScreen('screen-welcome');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Convert simple markdown to HTML (bold, italic, hr, paragraphs) */
function renderMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
