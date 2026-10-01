import { GAMES } from './games.js';
import { CSS, FONTS_HREF } from './styles.js';
import { gameAnimation } from './animations.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const e = escapeHtml;

export function layout(title, body, { current } = {}) {
  const link = (href, label, id) =>
    `<a href="${e(href)}"${id === current ? ' aria-current="page"' : ''}>${e(label)}</a>`;
  const links = [
    link('/', 'Overall', 'overall'),
    ...GAMES.map((g) => link(`/game/${g.id}`, g.name, g.id)),
    link('/admin', 'Admin', 'admin'),
  ].join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS_HREF}">
<style>${CSS}</style>
</head>
<body>
<header class="masthead">
<a class="title" href="/">Daily Leaderboard</a>
<span class="rule"></span>
<nav>${links}</nav>
</header>
<main>
${body}
</main>
</body>
</html>`;
}

const PERIODS = [
  ['today', 'Today'],
  ['week', 'Week'],
  ['all', 'All time'],
];

function tabs(basePath, period) {
  return `<div class="tabs">${PERIODS.map(
    ([id, label]) =>
      `<a href="${e(basePath)}?period=${id}"${id === period ? ' class="active"' : ''}>${label}</a>`,
  ).join('')}</div>`;
}

function rankCell(rank) {
  if (rank <= 3) return `<td class="rank"><span class="seal seal-${rank}" title="Rank ${rank}">${rank}</span></td>`;
  return `<td class="rank"><span class="numeral">${e(rank)}</span></td>`;
}

// columns: [{ label, cls, render(row) -> html }]
function ledger(columns, rows) {
  if (rows.length === 0) return '<div class="ledger"><p class="empty">No results yet</p></div>';
  const head = columns.map((c) => `<th${c.cls ? ` class="${c.cls}"` : ''}>${e(c.label)}</th>`).join('');
  const body = rows
    .map(
      (r, i) =>
        `<tr style="--i:${i}">${columns.map((c) => c.render(r, i)).join('')}</tr>`,
    )
    .join('');
  return `<div class="ledger"><div class="ledger-scroll"><table class="board"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></div>`;
}

const td = (cls, value) => `<td class="${cls}">${e(value)}</td>`;

function showcase() {
  return `<nav class="showcase" aria-label="Games">${GAMES.map(
    (g) => `<a href="/game/${e(g.id)}"><div class="art">${gameAnimation(g.id, { size: 'sm' })}</div><span class="name">${e(g.name)}</span></a>`,
  ).join('')}</nav>`;
}

const SCORING_NOTE = `<aside class="scoring-note" aria-labelledby="scoring-note-title">
<h2 id="scoring-note-title">How scoring works</h2>
<p>Each game, each day, the best three scores earn 3, 2 and 1 points. Ties share the better place, and the next place is skipped.</p>
<p>Fails and give-ups score 0 and take no place. A game played by only one person that day scores 0 for everyone.</p>
</aside>`;

export function overallPage({ period, board }) {
  const columns = [
    { label: '#', cls: 'rank', render: (r, i) => rankCell(i + 1) },
    { label: 'Player', render: (r) => td('player', r.playerName) },
    { label: 'Points', cls: 'num', render: (r) => `<td class="num"><span class="stamp">${e(r.points)}</span></td>` },
    { label: 'Played', cls: 'num', render: (r) => td('num', r.played) },
  ];
  return layout(
    'Overall - Daily Leaderboard',
    `${showcase()}<h1>Overall</h1>${tabs('/', period)}${ledger(columns, board)}${SCORING_NOTE}`,
    { current: 'overall' },
  );
}

export function gamePage({ game, period, board }) {
  const columns = [
    { label: '#', cls: 'rank', render: (r, i) => rankCell(i + 1) },
    { label: 'Player', render: (r) => td('player', r.playerName) },
    { label: 'Avg', cls: 'num', render: (r) => `<td class="num"><span class="stamp">${e(r.avg)}</span></td>` },
    { label: 'Played', cls: 'num', render: (r) => td('num', r.played) },
    { label: 'Wins', cls: 'num', render: (r) => td('num', r.wins) },
  ];
  return layout(
    `${game.name} - Daily Leaderboard`,
    `<div class="game-head">${gameAnimation(game.id, { size: 'lg' })}<h1>${e(game.name)}</h1></div>${tabs(`/game/${game.id}`, period)}${ledger(columns, board)}`,
    { current: game.id },
  );
}

export function loginPage({ error } = {}) {
  return layout(
    'Login - Daily Leaderboard',
    `<div class="login"><h1>Admin login</h1>
${error ? `<p class="error">${e(error)}</p>` : ''}
<div class="ledger plain"><form class="sheet-form" method="post" action="/login">
<label for="password">Password</label>
<input id="password" name="password" type="password" required autofocus>
<p class="actions"><button type="submit">Log in</button></p>
</form></div></div>`,
    { current: 'admin' },
  );
}

export function adminPage({ players, results, today, error, form = {} }) {
  const options = players
    .map(
      (p) =>
        `<option value="${e(p.id)}"${String(p.id) === String(form.playerId) ? ' selected' : ''}>${e(p.name)}</option>`,
    )
    .join('');
  const gameName = (id) => GAMES.find((g) => g.id === id)?.name ?? id;
  const scoreText = (r) => (r.failed ? (r.game === 'countryle' ? 'gave up' : 'X') : r.score);
  const rows = results
    .map(
      (r) => `<tr><td class="player">${e(r.playerName)}</td><td>${e(gameName(r.game))}</td><td class="date">${e(r.date)}</td><td class="num"><span class="stamp">${e(scoreText(r))}</span></td>
<td class="num"><form class="inline" method="post" action="/admin/results/${e(r.id)}/delete"><button type="submit">Delete</button></form></td></tr>`,
    )
    .join('');
  const recent = results.length
    ? `<div class="ledger plain"><div class="ledger-scroll"><table><thead><tr><th>Player</th><th>Game</th><th>Date</th><th class="num">Score</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`
    : '<div class="ledger plain"><p class="empty">No results yet</p></div>';
  return layout(
    'Admin - Daily Leaderboard',
    `<h1>Admin</h1>
${error ? `<p class="error">${e(error)}</p>` : ''}
<h2>Submit result</h2>
<div class="ledger plain"><form class="sheet-form" method="post" action="/admin/results">
<label for="playerId">Player</label>
<select id="playerId" name="playerId" required>${options}</select>
<label for="date">Date</label>
<input id="date" name="date" type="date" value="${e(form.date || today)}" required>
<label for="text">Share text</label>
<textarea id="text" name="text" required>${e(form.text ?? '')}</textarea>
<p class="actions"><button type="submit">Submit</button></p>
</form></div>
<h2>Add player</h2>
<div class="ledger plain"><form class="sheet-form" method="post" action="/admin/players">
<label for="name">Name</label>
<div class="inline-row"><input id="name" name="name" required>
<button type="submit">Add</button></div>
</form></div>
<h2>Recent results</h2>
${recent}
<form class="logout" method="post" action="/logout"><button type="submit">Log out</button></form>`,
    { current: 'admin' },
  );
}
