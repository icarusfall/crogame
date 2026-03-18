// === Be the CRO — Live Dashboard ===

const API = '';
let outcomesChart = null;
let strategiesChart = null;
let avgScoresChart = null;
let choicesChart = null;

const CHART_COLORS = {
  gold: '#c9a84c',
  blue: '#4a8ec9',
  red: '#c94a4a',
  green: '#4ac96a',
  amber: '#c9974a',
  purple: '#9b59b6',
  teal: '#1abc9c',
  muted: '#6b7280',
};

const OUTCOME_COLORS = {
  completed: CHART_COLORS.green,
  fired: CHART_COLORS.amber,
  insolvent: CHART_COLORS.red,
};

const STRATEGY_COLORS = {
  guardian: CHART_COLORS.blue,
  pragmatist: CHART_COLORS.amber,
  builder: CHART_COLORS.green,
  disruptor: CHART_COLORS.red,
};

const STRATEGY_LABELS = {
  guardian: 'Guardian',
  pragmatist: 'Pragmatist',
  builder: 'Builder',
  disruptor: 'Disruptor',
};

// Chart.js global defaults
Chart.defaults.color = '#9ca3af';
Chart.defaults.font.family = "'Source Sans 3', sans-serif";
Chart.defaults.plugins.legend.labels.padding = 12;

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// === CHART CREATION ===

function createOutcomesChart(data) {
  const ctx = document.getElementById('chart-outcomes').getContext('2d');
  const labels = Object.keys(data).map(capitalize);
  const values = Object.values(data);
  const colors = Object.keys(data).map(k => OUTCOME_COLORS[k] || CHART_COLORS.muted);

  if (outcomesChart) {
    outcomesChart.data.labels = labels;
    outcomesChart.data.datasets[0].data = values;
    outcomesChart.data.datasets[0].backgroundColor = colors;
    outcomesChart.update();
    return;
  }

  outcomesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#131925',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 13 } } },
      },
    },
  });
}

function createStrategiesChart(data) {
  const ctx = document.getElementById('chart-strategies').getContext('2d');
  const keys = ['guardian', 'pragmatist', 'builder', 'disruptor'];
  const labels = keys.map(k => STRATEGY_LABELS[k]);
  const values = keys.map(k => data[k] || 0);
  const colors = keys.map(k => STRATEGY_COLORS[k]);

  if (strategiesChart) {
    strategiesChart.data.datasets[0].data = values;
    strategiesChart.update();
    return;
  }

  strategiesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#131925',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 13 } } },
      },
    },
  });
}

function createAvgScoresChart(data) {
  const ctx = document.getElementById('chart-avg-scores').getContext('2d');
  const strategies = ['guardian', 'pragmatist', 'builder', 'disruptor'];
  const dimensions = ['solvency_ratio', 'cumulative_pnl', 'reputation', 'board_confidence'];
  const dimLabels = ['Solvency', 'P&L', 'Reputation', 'Board'];

  const datasets = strategies
    .filter(s => data[s])
    .map(s => ({
      label: STRATEGY_LABELS[s],
      data: dimensions.map(d => data[s]?.[d] || 0),
      backgroundColor: STRATEGY_COLORS[s],
      borderRadius: 4,
    }));

  if (avgScoresChart) {
    avgScoresChart.data.datasets = datasets;
    avgScoresChart.update();
    return;
  }

  avgScoresChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dimLabels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 } } },
      },
      scales: {
        x: {
          grid: { color: '#2a3348' },
          ticks: { font: { size: 12 } },
        },
        y: {
          grid: { color: '#2a3348' },
          ticks: { font: { size: 11 } },
        },
      },
    },
  });
}

function createChoicesChart(data) {
  const ctx = document.getElementById('chart-choices').getContext('2d');

  // Sort scenarios by total responses (most played first)
  const scenarios = Object.entries(data)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 12); // Max 12 scenarios

  const labels = scenarios.map(([, s]) => truncate(s.title, 28));

  // Collect all unique option indices across scenarios (up to 5)
  const optionColors = [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.red, CHART_COLORS.purple];
  const maxOptions = 5;
  const datasets = [];

  for (let i = 0; i < maxOptions; i++) {
    const optData = scenarios.map(([, s]) => {
      const opts = Object.values(s.options);
      if (i >= opts.length) return 0;
      return opts[i].percentage;
    });

    const optLabels = scenarios.map(([, s]) => {
      const opts = Object.values(s.options);
      if (i >= opts.length) return '';
      return truncate(opts[i].label, 40);
    });

    // Only add dataset if it has data
    if (optData.some(v => v > 0)) {
      datasets.push({
        label: `Option ${i + 1}`,
        data: optData,
        backgroundColor: optionColors[i],
        borderRadius: 2,
        optionLabels: optLabels, // Custom property for tooltip
      });
    }
  }

  if (choicesChart) {
    choicesChart.data.labels = labels;
    choicesChart.data.datasets = datasets;
    choicesChart.update();
    return;
  }

  choicesChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const ds = context.dataset;
              const lbl = ds.optionLabels?.[context.dataIndex] || ds.label;
              return `${lbl}: ${context.parsed.x}%`;
            }
          }
        },
      },
      scales: {
        x: {
          stacked: true,
          max: 100,
          grid: { color: '#2a3348' },
          ticks: { callback: v => v + '%', font: { size: 11 } },
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 12 } },
        },
      },
    },
  });
}

function truncate(str, maxLen) {
  if (!str) return '';
  return str.length <= maxLen ? str : str.slice(0, maxLen - 1) + '\u2026';
}

// === LEADERBOARD ===

function renderLeaderboard(rankings) {
  const tbody = document.getElementById('lb-body');

  if (!rankings || rankings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No completed games yet</td></tr>';
    return;
  }

  tbody.innerHTML = rankings.slice(0, 10).map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="player-name">${escapeHtml(r.player_name)}</td>
      <td>${capitalize(r.strategy)}</td>
      <td>${escapeHtml(r.tenure_title || 'In Progress')}</td>
      <td class="score-cell">${r.composite_score.toFixed(1)}</td>
    </tr>
  `).join('');
}

// === DATA FETCHING ===

async function fetchAndRender() {
  try {
    const [statsRes, lbRes] = await Promise.all([
      fetch(`${API}/api/stats`),
      fetch(`${API}/api/leaderboard?limit=10`),
    ]);

    const stats = await statsRes.json();
    const lb = await lbRes.json();

    // Header stats
    document.getElementById('stat-total').textContent = stats.total_sessions;
    document.getElementById('stat-completed').textContent = stats.completed_sessions;
    document.getElementById('stat-live').textContent = stats.in_progress;

    // Charts
    createOutcomesChart(stats.outcome_distribution);
    createStrategiesChart(stats.strategy_distribution);
    createAvgScoresChart(stats.average_scores_by_strategy);

    if (Object.keys(stats.choice_distributions).length > 0) {
      createChoicesChart(stats.choice_distributions);
    }

    // Leaderboard
    renderLeaderboard(lb.rankings);

    // Timestamp
    document.getElementById('last-updated').textContent =
      'Updated: ' + new Date().toLocaleTimeString();

  } catch (err) {
    console.error('Failed to fetch stats:', err);
  }
}

// Initial load + auto-refresh
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRender();
  setInterval(fetchAndRender, 10000);
});
