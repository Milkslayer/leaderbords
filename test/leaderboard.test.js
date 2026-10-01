import { describe, it, expect } from 'vitest';
import { periodStart, gameBoard, overallBoard } from '../src/leaderboard.js';

const r = (playerName, game, date, score, failed = false) => ({ playerId: playerName, playerName, game, date, score, failed });
const fail = (playerName, game, date, score) => r(playerName, game, date, score, true);

describe('periodStart', () => {
  it('today', () => expect(periodStart('today', '2026-10-01')).toBe('2026-10-01'));
  it('week crosses month boundary', () => {
    expect(periodStart('week', '2026-10-03')).toBe('2026-09-27');
    expect(periodStart('week', '2026-03-02')).toBe('2026-02-24');
  });
  it('week crosses year boundary', () => expect(periodStart('week', '2026-01-03')).toBe('2025-12-28'));
  it('all', () => expect(periodStart('all', '2026-10-01')).toBeNull());
});

describe('gameBoard', () => {
  it('empty input', () => expect(gameBoard([], 'wordle')).toEqual([]));

  it('filters to the game', () => {
    const rows = [r('a', 'wordle', 'd1', 3), r('b', 'wordle', 'd1', 4), r('a', 'flagle', 'd1', 5), r('b', 'flagle', 'd1', 1)];
    expect(gameBoard(rows, 'wordle')).toEqual([
      { playerName: 'a', played: 1, avg: 3, wins: 1 },
      { playerName: 'b', played: 1, avg: 4, wins: 0 },
    ]);
  });

  it('a solo round gives no win', () => {
    expect(gameBoard([r('a', 'wordle', 'd1', 3)], 'wordle')).toEqual([{ playerName: 'a', played: 1, avg: 3, wins: 0 }]);
  });

  it('fails never win; the best non-failed score wins', () => {
    const rows = [fail('a', 'countryle', 'd1', 10), r('b', 'countryle', 'd1', 12)];
    expect(gameBoard(rows, 'countryle')).toEqual([
      { playerName: 'a', played: 1, avg: 10, wins: 0 },
      { playerName: 'b', played: 1, avg: 12, wins: 1 },
    ]);
  });

  it('a round where everyone failed has no winner; fails count in avg', () => {
    const rows = [fail('a', 'wordle', 'd1', 7), fail('b', 'wordle', 'd1', 7), r('a', 'wordle', 'd2', 3), r('b', 'wordle', 'd2', 3)];
    expect(gameBoard(rows, 'wordle')).toEqual([
      { playerName: 'a', played: 2, avg: 5, wins: 1 },
      { playerName: 'b', played: 2, avg: 5, wins: 1 },
    ]);
  });

  it('rounds avg to 2 decimals', () => {
    const rows = [r('a', 'wordle', 'd1', 3), r('a', 'wordle', 'd2', 4), r('a', 'wordle', 'd3', 4)];
    expect(gameBoard(rows, 'wordle')[0].avg).toBe(3.67);
  });

  it('ties all count as wins', () => {
    const rows = [r('a', 'wordle', 'd1', 3), r('b', 'wordle', 'd1', 3), r('c', 'wordle', 'd1', 5)];
    const out = gameBoard(rows, 'wordle');
    expect(out.map((x) => [x.playerName, x.wins])).toEqual([['a', 1], ['b', 1], ['c', 0]]);
  });

  it('sorts by avg asc, played desc, name asc', () => {
    const rows = [
      r('z', 'wordle', 'd1', 2),
      r('b', 'wordle', 'd1', 4), r('b', 'wordle', 'd2', 4),
      r('a', 'wordle', 'd1', 4),
      r('c', 'wordle', 'd1', 4), r('c', 'wordle', 'd2', 4),
    ];
    expect(gameBoard(rows, 'wordle').map((x) => x.playerName)).toEqual(['z', 'b', 'c', 'a']);
  });
});

describe('overallBoard', () => {
  it('empty input', () => expect(overallBoard([])).toEqual([]));

  it('competition ranking 2,2,3 -> 3,3,1 and 4th gets 0', () => {
    const rows = [
      r('a', 'wordle', 'd1', 2), r('b', 'wordle', 'd1', 2),
      r('c', 'wordle', 'd1', 3), r('d', 'wordle', 'd1', 4),
    ];
    expect(overallBoard(rows)).toEqual([
      { playerName: 'a', points: 3, played: 1 },
      { playerName: 'b', points: 3, played: 1 },
      { playerName: 'c', points: 1, played: 1 },
      { playerName: 'd', points: 0, played: 1 },
    ]);
  });

  it('rank after tie skips (1,1,3 -> 3,3,1) and second place gets 2', () => {
    const rows = [r('a', 'g', 'd', 1), r('b', 'g', 'd', 2), r('c', 'g', 'd', 3)];
    expect(overallBoard(rows).map((x) => x.points)).toEqual([3, 2, 1]);
  });

  it('sums across games and dates; sort tiebreaks played desc then name', () => {
    const rows = [
      r('a', 'wordle', 'd1', 1), r('b', 'wordle', 'd1', 2),
      r('a', 'flagle', 'd1', 2), r('b', 'flagle', 'd1', 1),
      r('c', 'wordle', 'd2', 1),
      r('d', 'wordle', 'd3', 1),
      r('d', 'flagle', 'd3', 9), // solo rounds -> 0 pts
    ];
    expect(overallBoard(rows)).toEqual([
      { playerName: 'a', points: 5, played: 2 },
      { playerName: 'b', points: 5, played: 2 },
      { playerName: 'd', points: 0, played: 2 },
      { playerName: 'c', points: 0, played: 1 },
    ]);
  });

  it('a round with one player awards nothing', () => {
    expect(overallBoard([r('a', 'wordle', 'd1', 1)])).toEqual([{ playerName: 'a', points: 0, played: 1 }]);
  });

  it('a fail counts as a player for the 2-player minimum but scores 0', () => {
    const rows = [r('a', 'wordle', 'd1', 6), fail('b', 'wordle', 'd1', 7)];
    expect(overallBoard(rows)).toEqual([
      { playerName: 'a', points: 3, played: 1 },
      { playerName: 'b', points: 0, played: 1 },
    ]);
  });

  it('fails do not take a place among the non-failed', () => {
    const rows = [
      fail('a', 'countryle', 'd1', 10),
      r('b', 'countryle', 'd1', 11), r('c', 'countryle', 'd1', 11), r('d', 'countryle', 'd1', 12),
    ];
    expect(overallBoard(rows)).toEqual([
      { playerName: 'b', points: 3, played: 1 },
      { playerName: 'c', points: 3, played: 1 },
      { playerName: 'd', points: 1, played: 1 },
      { playerName: 'a', points: 0, played: 1 },
    ]);
  });

  it('second place after a fail gets 2', () => {
    const rows = [fail('a', 'wordle', 'd1', 7), r('b', 'wordle', 'd1', 5), r('c', 'wordle', 'd1', 6)];
    expect(overallBoard(rows).map((x) => [x.playerName, x.points])).toEqual([['b', 3], ['c', 2], ['a', 0]]);
  });

  it('a round where everyone failed awards nothing', () => {
    const rows = [fail('a', 'wordle', 'd1', 7), fail('b', 'wordle', 'd1', 7)];
    expect(overallBoard(rows).map((x) => x.points)).toEqual([0, 0]);
  });
});
