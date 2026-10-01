import { GAMES } from './games.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const e = escapeHtml;

const CSS = `
*{box-sizing:border-box}
body{margin:0;font:16px/1.5 system-ui,sans-serif;color:#1a1a1a;background:#f6f6f4}
main,header nav{max-width:720px;margin:0 auto;padding:0 16px}
header{background:#fff;border-bottom:1px solid #ddd}
header nav{display:flex;flex-wrap:wrap;gap:4px 16px;padding-top:12px;padding-bottom:12px}
a{color:#0b5cad}
nav a{text-decoration:none;font-weight:600}
h1{font-size:1.5rem;margin:24px 0 12px}
h2{font-size:1.1rem;margin:28px 0 8px}
.tabs{display:flex;gap:8px;margin:0 0 16px}
.tabs a{padding:4px 12px;border:1px solid #ccc;border-radius:16px;text-decoration:none;background:#fff}
.tabs a.active{background:#1a1a1a;color:#fff;border-color:#1a1a1a}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #ddd}
th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #eee}
th{background:#fafafa;font-size:.85rem}
td.num,th.num{text-align:right}
.error{background:#fde8e8;border:1px solid #e0a0a0;padding:8px 12px;border-radius:4px}
.empty{color:#666}
form{margin:0 0 12px}
label{display:block;margin:8px 0 2px;font-size:.9rem}
input,select,textarea,button{font:inherit;padding:6px 8px;max-width:100%}
textarea{width:100%;min-height:120px}
button{cursor:pointer}
.inline{display:inline}
`;

export function layout(title, body) {
  const links = [
    '<a href="/">Overall</a>',
    ...GAMES.map((g) => `<a href="/game/${e(g.id)}">${e(g.name)}</a>`),
    '<a href="/admin">Admin</a>',
  ].join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<style>${CSS}</style>
</head>
<body>
<header><nav>${links}</nav></header>
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

function table(headers, rows) {
  if (rows.length === 0) return '<p class="empty">No results yet</p>';
  const head = headers.map((h, i) => `<th${i > 0 ? ' class="num"' : ''}>${e(h)}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${r.map((c, i) => `<td${i > 0 ? ' class="num"' : ''}>${e(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function overallPage({ period, board }) {
  const rows = board.map((r, i) => [i + 1, r.playerName, r.points, r.played]);
  return layout(
    'Overall - Daily Leaderboard',
    `<h1>Overall</h1>${tabs('/', period)}${table(['#', 'Player', 'Points', 'Played'], rows)}`,
  );
}

export function gamePage({ game, period, board }) {
  const rows = board.map((r) => [r.playerName, r.avg, r.played, r.wins]);
  return layout(
    `${game.name} - Daily Leaderboard`,
    `<h1>${e(game.name)}</h1>${tabs(`/game/${game.id}`, period)}${table(['Player', 'Avg', 'Played', 'Wins'], rows)}`,
  );
}

export function loginPage({ error } = {}) {
  return layout(
    'Login - Daily Leaderboard',
    `<h1>Admin login</h1>
${error ? `<p class="error">${e(error)}</p>` : ''}
<form method="post" action="/login">
<label for="password">Password</label>
<input id="password" name="password" type="password" required autofocus>
<button type="submit">Log in</button>
</form>`,
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
  const rows = results
    .map(
      (r) => `<tr><td>${e(r.playerName)}</td><td>${e(gameName(r.game))}</td><td>${e(r.date)}</td><td class="num">${e(r.score)}</td>
<td><form class="inline" method="post" action="/admin/results/${e(r.id)}/delete"><button type="submit">Delete</button></form></td></tr>`,
    )
    .join('');
  const recent = results.length
    ? `<table><thead><tr><th>Player</th><th>Game</th><th>Date</th><th class="num">Score</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
    : '<p class="empty">No results yet</p>';
  return layout(
    'Admin - Daily Leaderboard',
    `<h1>Admin</h1>
${error ? `<p class="error">${e(error)}</p>` : ''}
<h2>Submit result</h2>
<form method="post" action="/admin/results">
<label for="playerId">Player</label>
<select id="playerId" name="playerId" required>${options}</select>
<label for="date">Date</label>
<input id="date" name="date" type="date" value="${e(form.date || today)}" required>
<label for="text">Share text</label>
<textarea id="text" name="text" required>${e(form.text ?? '')}</textarea>
<p><button type="submit">Submit</button></p>
</form>
<h2>Add player</h2>
<form method="post" action="/admin/players">
<label for="name">Name</label>
<input id="name" name="name" required>
<button type="submit">Add</button>
</form>
<h2>Recent results</h2>
${recent}
<form method="post" action="/logout"><button type="submit">Log out</button></form>`,
  );
}
