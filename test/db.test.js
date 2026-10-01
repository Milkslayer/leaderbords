import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { openDb } from '../src/db.js';

describe('db', () => {
  let db;
  beforeEach(() => {
    db = openDb(':memory:');
  });

  it('adds and lists players ordered by name', () => {
    const b = db.addPlayer('bob');
    const a = db.addPlayer('Alice');
    expect(a).toEqual({ id: expect.any(Number), name: 'Alice' });
    expect(b.name).toBe('bob');
    expect(db.listPlayers()).toEqual([
      { id: a.id, name: 'Alice' },
      { id: b.id, name: 'bob' },
    ]);
  });

  it('rejects duplicate player names case-insensitively', () => {
    db.addPlayer('Alice');
    expect(() => db.addPlayer('alice')).toThrow('Player already exists');
  });

  it('upsert replaces the score for the same player/game/date', () => {
    const p = db.addPlayer('Alice');
    db.upsertResult({ playerId: p.id, game: 'wordle', date: '2026-10-01', score: 4, raw: 'a' });
    db.upsertResult({ playerId: p.id, game: 'wordle', date: '2026-10-01', score: 2, raw: 'b' });
    const rows = db.resultsSince(null);
    expect(rows).toHaveLength(1);
    expect(rows[0].score).toBe(2);
  });

  it('deletes a result', () => {
    const p = db.addPlayer('Alice');
    db.upsertResult({ playerId: p.id, game: 'wordle', date: '2026-10-01', score: 4, raw: 'a' });
    const [r] = db.recentResults(10);
    db.deleteResult(r.id);
    expect(db.recentResults(10)).toEqual([]);
  });

  it('recentResults orders newest first, ties by id desc, and limits', () => {
    const p = db.addPlayer('Alice');
    for (const [i, game] of ['wordle', 'flagle', 'globle'].entries()) {
      db.upsertResult({ playerId: p.id, game, date: '2026-10-01', score: i + 1, raw: 'x' });
    }
    const rows = db.recentResults(10);
    expect(rows.map((r) => r.game)).toEqual(['globle', 'flagle', 'wordle']);
    expect(rows[0]).toEqual({
      id: expect.any(Number),
      playerName: 'Alice',
      game: 'globle',
      date: '2026-10-01',
      score: 3,
      failed: false,
    });
    expect(db.recentResults(2)).toHaveLength(2);
  });

  it('resultsSince bounds by toDate', () => {
    const p = db.addPlayer('Alice');
    for (const date of ['2026-09-30', '2026-10-01', '2026-10-02']) {
      db.upsertResult({ playerId: p.id, game: 'wordle', date, score: 3, raw: 'x' });
    }
    const rows = db.resultsSince('2026-09-30', '2026-10-01');
    expect(rows.map((r) => r.date).sort()).toEqual(['2026-09-30', '2026-10-01']);
    expect(db.resultsSince(null, '2026-09-30')).toHaveLength(1);
  });

  it('resultsSince filters by date', () => {
    const p = db.addPlayer('Alice');
    for (const date of ['2026-09-28', '2026-09-30', '2026-10-01']) {
      db.upsertResult({ playerId: p.id, game: 'wordle', date, score: 3, raw: 'x' });
    }
    const rows = db.resultsSince('2026-09-30');
    expect(rows.map((r) => r.date).sort()).toEqual(['2026-09-30', '2026-10-01']);
    expect(rows[0]).toEqual({
      playerId: p.id,
      playerName: 'Alice',
      game: 'wordle',
      date: expect.any(String),
      score: 3,
      failed: false,
    });
    expect(db.resultsSince(null)).toHaveLength(3);
  });

  it('stores and returns failed as a boolean', () => {
    const p = db.addPlayer('Alice');
    db.upsertResult({ playerId: p.id, game: 'wordle', date: '2026-10-01', score: 7, raw: 'x', failed: true });
    db.upsertResult({ playerId: p.id, game: 'flagle', date: '2026-10-01', score: 3, raw: 'x', failed: false });
    const byGame = Object.fromEntries(db.resultsSince(null).map((r) => [r.game, r.failed]));
    expect(byGame).toEqual({ wordle: true, flagle: false });
    expect(db.recentResults(10).find((r) => r.game === 'wordle').failed).toBe(true);
  });

  it('upsert overwrites failed', () => {
    const p = db.addPlayer('Alice');
    db.upsertResult({ playerId: p.id, game: 'wordle', date: '2026-10-01', score: 7, raw: 'x', failed: true });
    db.upsertResult({ playerId: p.id, game: 'wordle', date: '2026-10-01', score: 4, raw: 'y', failed: false });
    expect(db.resultsSince(null)[0]).toMatchObject({ score: 4, failed: false });
  });
});

describe('db migration', () => {
  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lb-migrate-'));
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  const gaveUp = '#Countryle 1234\nGave up after 5 tries.\n\n🟩🟨⬜\n🏳️🏳️🏳️🏳️🏳️\n';

  function oldDb(file) {
    const old = new Database(file);
    old.exec(`
      CREATE TABLE players (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE COLLATE NOCASE);
      CREATE TABLE results (
        id INTEGER PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        game TEXT NOT NULL, date TEXT NOT NULL, score INTEGER NOT NULL, raw TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (player_id, game, date)
      );
      INSERT INTO players (id, name) VALUES (1, 'Alice');
    `);
    const ins = old.prepare('INSERT INTO results (player_id, game, date, score, raw) VALUES (1, ?, ?, ?, ?)');
    ins.run('wordle', '2026-09-01', 7, 'Wordle 1,535 X/6');
    ins.run('wordle', '2026-09-02', 4, 'Wordle 1,536 4/6');
    ins.run('flagle', '2026-09-01', 7, 'Flagle X/6');
    ins.run('flagle', '2026-09-02', 2, 'Flagle 2/6');
    ins.run('countryle', '2026-09-01', 5, gaveUp);
    ins.run('countryle', '2026-09-02', 3, '#Countryle 1234\nGuessed in 3 tries.\n');
    ins.run('globle', '2026-09-01', 7, '🌎 Sep 1 🌍\n🟩 = 7');
    ins.run('countryle', '2026-09-03', 6, 'Countryle: gave up, sorry');
    old.close();
  }

  const rowsOf = (d) =>
    Object.fromEntries(d.resultsSince(null).map((r) => [`${r.game} ${r.date}`, [r.score, r.failed]]));

  const expected = {
    'wordle 2026-09-01': [7, true],
    'wordle 2026-09-02': [4, false],
    'flagle 2026-09-01': [7, true],
    'flagle 2026-09-02': [2, false],
    'countryle 2026-09-01': [10, true],
    'countryle 2026-09-02': [3, false],
    'globle 2026-09-01': [7, false],
    'countryle 2026-09-03': [6, true], // gave up but unparseable: failed, score kept
  };

  it('adds the failed column and backfills existing rows', () => {
    const file = path.join(dir, 'old.db');
    oldDb(file);
    const d = openDb(file);
    expect(rowsOf(d)).toEqual(expected);
    d.close();
    const raw = new Database(file);
    const col = raw.prepare('PRAGMA table_info(results)').all().find((c) => c.name === 'failed');
    raw.close();
    expect(col).toMatchObject({ type: 'INTEGER', notnull: 1, dflt_value: '0' });
  });

  it('is idempotent across restarts', () => {
    const file = path.join(dir, 'old.db');
    oldDb(file);
    openDb(file).close();
    const d = openDb(file);
    expect(rowsOf(d)).toEqual(expected);
    d.close();
  });
});
