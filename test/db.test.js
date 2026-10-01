import { describe, it, expect, beforeEach } from 'vitest';
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
    });
    expect(db.recentResults(2)).toHaveLength(2);
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
    });
    expect(db.resultsSince(null)).toHaveLength(3);
  });
});
