const DAY_MS = 24 * 60 * 60 * 1000;

export function periodStart(period, today) {
  if (period === 'today') return today;
  if (period === 'week') {
    const [y, m, d] = today.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d) - 6 * DAY_MS).toISOString().slice(0, 10);
  }
  return null;
}

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return map;
}

const byName = (a, b) => (a.playerName < b.playerName ? -1 : a.playerName > b.playerName ? 1 : 0);

const roundKey = (r) => `${r.game}\u0000${r.date}`;
const MIN_PLAYERS = 2;

export function gameBoard(rows, gameId) {
  const gameRows = rows.filter((r) => r.game === gameId);
  // Best non-failed score per date, only for rounds with enough players.
  const best = new Map();
  for (const [date, list] of groupBy(gameRows, (r) => r.date)) {
    if (list.length < MIN_PLAYERS) continue;
    const solved = list.filter((r) => !r.failed);
    if (solved.length) best.set(date, Math.min(...solved.map((r) => r.score)));
  }
  const board = [];
  for (const list of groupBy(gameRows, (r) => r.playerId).values()) {
    const sum = list.reduce((s, r) => s + r.score, 0);
    board.push({
      playerName: list[0].playerName,
      played: list.length,
      avg: Math.round((sum / list.length) * 100) / 100,
      wins: list.filter((r) => !r.failed && r.score === best.get(r.date)).length,
    });
  }
  return board.sort((a, b) => a.avg - b.avg || b.played - a.played || byName(a, b));
}

const POINTS = [3, 2, 1];

export function overallBoard(rows) {
  const players = new Map();
  for (const r of rows) {
    if (!players.has(r.playerId)) players.set(r.playerId, { playerName: r.playerName, points: 0, played: 0 });
    players.get(r.playerId).played++;
  }
  for (const list of groupBy(rows, roundKey).values()) {
    if (list.length < MIN_PLAYERS) continue;
    const solved = list.filter((r) => !r.failed);
    for (const r of solved) {
      const rank = 1 + solved.filter((o) => o.score < r.score).length;
      players.get(r.playerId).points += POINTS[rank - 1] ?? 0;
    }
  }
  return [...players.values()].sort((a, b) => b.points - a.points || b.played - a.played || byName(a, b));
}
