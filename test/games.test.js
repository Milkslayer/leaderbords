import { describe, it, expect } from 'vitest';
import { GAMES, getGame, parseShare, ParseError } from '../src/games.js';

const grid = '\n\n⬛⬛⬛⬛⬛\n🟩🟩⬛⬛⬛\n🟩🟩🟩🟩🟩';

describe('GAMES', () => {
  it('lists games in order with fail scores', () => {
    expect(GAMES.map((g) => g.id)).toEqual(['wordle', 'countryle', 'globle', 'flagle']);
    expect(GAMES.map((g) => g.failScore)).toEqual([7, null, null, 7]);
    expect(getGame('globle').name).toBe('Globle');
    expect(getGame('nope')).toBeUndefined();
  });
});

describe('wordle', () => {
  it('parses a normal score', () => {
    expect(parseShare('Wordle 1,064 4/6' + grid)).toEqual({ gameId: 'wordle', score: 4 });
  });
  it('parses comma-less number', () => {
    expect(parseShare('Wordle 1571 3/6')).toEqual({ gameId: 'wordle', score: 3 });
  });
  it('parses hard mode and # prefix', () => {
    expect(parseShare('#Wordle 1,063 4/6*' + grid)).toEqual({ gameId: 'wordle', score: 4 });
  });
  it('parses fail as 7', () => {
    expect(parseShare('Wordle 1571 X/6*')).toEqual({ gameId: 'wordle', score: 7 });
  });
  it('tolerates surrounding whitespace and case', () => {
    expect(parseShare('  \n wordle 1,064 2/6\n\n')).toEqual({ gameId: 'wordle', score: 2 });
  });
  it('rejects out-of-range score', () => {
    expect(() => parseShare('Wordle 1571 9/6')).toThrow(ParseError);
  });
});

describe('flagle', () => {
  it('parses a score', () => {
    expect(parseShare('#Flagle #123 3/6\n🟩⬜⬜\n🟩🟩🟩')).toEqual({ gameId: 'flagle', score: 3 });
  });
  it('parses a fail as 7', () => {
    expect(parseShare('Flagle X/6')).toEqual({ gameId: 'flagle', score: 7 });
  });
  it('rejects without score', () => {
    expect(() => parseShare('Flagle is fun')).toThrow(ParseError);
  });
});

describe('globle', () => {
  it('parses = N', () => {
    expect(parseShare('🌎 Oct 1, 2026 🌍\n🟥🟧🟨🟩 = 4')).toEqual({ gameId: 'globle', score: 4 });
  });
  it('ignores streak line (real header format)', () => {
    expect(parseShare('🌎 May 12, 2024 🌍\n🔥 8 | Avg. Guesses: 5.25\n🟨🟧🟥🟩 = 6')).toEqual({
      gameId: 'globle',
      score: 6,
    });
  });
  it('is case-insensitive and surrounded by whitespace', () => {
    expect(parseShare('\n  Globle\n🟩 = 1  \n')).toEqual({ gameId: 'globle', score: 1 });
  });
  it('rejects without = N', () => {
    expect(() => parseShare('Globle today was hard')).toThrow(ParseError);
  });
});

describe('countryle', () => {
  it.each([
    ['Countryle: I found it in 4 tries', 4],
    ['Countryle 4 tries', 4],
    ['Countryle in 1 try', 1],
    ['#Countryle 12 guesses\n🟩🟩⬜', 12],
  ])('parses %s', (text, score) => {
    expect(parseShare(text)).toEqual({ gameId: 'countryle', score });
  });
  it('rejects without count', () => {
    expect(() => parseShare('Countryle rocks')).toThrow(ParseError);
  });
});

describe('detection order', () => {
  it('countryle with globe emoji line stays countryle', () => {
    expect(parseShare('Countryle 🌎 Oct 1 🌍\nI got it in 4 tries')).toEqual({ gameId: 'countryle', score: 4 });
  });
  it('globe emoji without = N is not globle', () => {
    expect(() => parseShare('🌎 Oct 1 🌍')).toThrow(/detect/i);
  });
});

describe('unknown', () => {
  it('throws ParseError with message', () => {
    expect(() => parseShare('hello world')).toThrow(ParseError);
    expect(() => parseShare('hello world')).toThrow(/game/i);
    expect(() => parseShare('')).toThrow(ParseError);
    expect(() => parseShare(undefined)).toThrow(ParseError);
  });
});
