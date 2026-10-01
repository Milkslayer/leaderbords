import Database from 'better-sqlite3';
import { parseShare } from './games.js';

// Adds results.failed to databases created before it existed, backfilling old rows.
// Runs only when the column is missing, so it is safe on every start.
function migrateFailed(db) {
  const cols = db.prepare('PRAGMA table_info(results)').all();
  if (cols.some((c) => c.name === 'failed')) return;
  db.transaction(() => {
    db.exec('ALTER TABLE results ADD COLUMN failed INTEGER NOT NULL DEFAULT 0');
    db.exec("UPDATE results SET failed = 1 WHERE game IN ('wordle', 'flagle') AND score = 7");
    const fix = db.prepare('UPDATE results SET score = ?, failed = ? WHERE id = ?');
    for (const row of db.prepare("SELECT id, raw FROM results WHERE game = 'countryle'").all()) {
      if (!/gave up/i.test(row.raw)) continue;
      let parsed;
      try {
        parsed = parseShare(row.raw);
      } catch {
        continue;
      }
      if (parsed.gameId === 'countryle') fix.run(parsed.score, parsed.failed ? 1 : 0, row.id);
    }
  })();
}

const withFailedBool = (row) => ({ ...row, failed: row.failed === 1 });

export function openDb(path) {
  const db = new Database(path);
  if (path !== ':memory:') db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE COLLATE NOCASE);
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY,
      player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      game TEXT NOT NULL, date TEXT NOT NULL, score INTEGER NOT NULL, raw TEXT NOT NULL,
      failed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (player_id, game, date)
    );
  `);
  migrateFailed(db);

  const insertPlayer = db.prepare('INSERT INTO players (name) VALUES (?)');
  const selectPlayers = db.prepare('SELECT id, name FROM players ORDER BY name COLLATE NOCASE');
  const upsert = db.prepare(`
    INSERT INTO results (player_id, game, date, score, raw, failed)
    VALUES (@playerId, @game, @date, @score, @raw, @failed)
    ON CONFLICT (player_id, game, date)
    DO UPDATE SET score = excluded.score, raw = excluded.raw, failed = excluded.failed, created_at = datetime('now')
  `);
  const removeResult = db.prepare('DELETE FROM results WHERE id = ?');
  const selectRecent = db.prepare(`
    SELECT r.id AS id, p.name AS playerName, r.game AS game, r.date AS date, r.score AS score, r.failed AS failed
    FROM results r JOIN players p ON p.id = r.player_id
    ORDER BY r.created_at DESC, r.id DESC
    LIMIT ?
  `);
  const selectSince = db.prepare(`
    SELECT r.player_id AS playerId, p.name AS playerName, r.game AS game, r.date AS date, r.score AS score, r.failed AS failed
    FROM results r JOIN players p ON p.id = r.player_id
    WHERE (@fromDate IS NULL OR r.date >= @fromDate)
      AND (@toDate IS NULL OR r.date <= @toDate)
  `);

  return {
    addPlayer(name) {
      try {
        const info = insertPlayer.run(name);
        return { id: Number(info.lastInsertRowid), name };
      } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') throw new Error('Player already exists');
        throw err;
      }
    },
    listPlayers() {
      return selectPlayers.all();
    },
    upsertResult({ playerId, game, date, score, raw, failed = false }) {
      upsert.run({ playerId, game, date, score, raw, failed: failed ? 1 : 0 });
    },
    deleteResult(id) {
      removeResult.run(id);
    },
    recentResults(limit) {
      return selectRecent.all(limit).map(withFailedBool);
    },
    resultsSince(fromDate, toDate) {
      return selectSince.all({ fromDate: fromDate ?? null, toDate: toDate ?? null }).map(withFailedBool);
    },
    close() {
      db.close();
    },
  };
}
