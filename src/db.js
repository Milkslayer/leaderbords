import Database from 'better-sqlite3';

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
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (player_id, game, date)
    );
  `);

  const insertPlayer = db.prepare('INSERT INTO players (name) VALUES (?)');
  const selectPlayers = db.prepare('SELECT id, name FROM players ORDER BY name COLLATE NOCASE');
  const upsert = db.prepare(`
    INSERT INTO results (player_id, game, date, score, raw)
    VALUES (@playerId, @game, @date, @score, @raw)
    ON CONFLICT (player_id, game, date)
    DO UPDATE SET score = excluded.score, raw = excluded.raw, created_at = datetime('now')
  `);
  const removeResult = db.prepare('DELETE FROM results WHERE id = ?');
  const selectRecent = db.prepare(`
    SELECT r.id AS id, p.name AS playerName, r.game AS game, r.date AS date, r.score AS score
    FROM results r JOIN players p ON p.id = r.player_id
    ORDER BY r.created_at DESC, r.id DESC
    LIMIT ?
  `);
  const selectSince = db.prepare(`
    SELECT r.player_id AS playerId, p.name AS playerName, r.game AS game, r.date AS date, r.score AS score
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
    upsertResult({ playerId, game, date, score, raw }) {
      upsert.run({ playerId, game, date, score, raw });
    },
    deleteResult(id) {
      removeResult.run(id);
    },
    recentResults(limit) {
      return selectRecent.all(limit);
    },
    resultsSince(fromDate, toDate) {
      return selectSince.all({ fromDate: fromDate ?? null, toDate: toDate ?? null });
    },
    close() {
      db.close();
    },
  };
}
