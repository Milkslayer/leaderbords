import { describe, it, expect } from 'vitest';
import { GAMES, getGame, parseShare, ParseError } from '../src/games.js';

const grid = '\n\n⬛⬛⬛⬛⬛\n🟩🟩⬛⬛⬛\n🟩🟩🟩🟩🟩';

describe('GAMES', () => {
  it('lists games in order with fail scores', () => {
    expect(GAMES.map((g) => g.id)).toEqual(['wordle', 'countryle', 'globle', 'flagle', 'poople']);
    expect(GAMES.map((g) => g.failScore)).toEqual([7, null, null, 7, null]);
    expect(getGame('globle').name).toBe('Globle');
    expect(getGame('nope')).toBeUndefined();
  });
});

describe('wordle', () => {
  it('parses a normal score', () => {
    expect(parseShare('Wordle 1,064 4/6' + grid)).toEqual({ gameId: 'wordle', score: 4, failed: false });
  });
  it('parses comma-less number', () => {
    expect(parseShare('Wordle 1571 3/6')).toEqual({ gameId: 'wordle', score: 3, failed: false });
  });
  it('parses dot thousands separator', () => {
    expect(parseShare('Wordle 1.571 4/6')).toEqual({ gameId: 'wordle', score: 4, failed: false });
  });
  it('parses hard mode and # prefix', () => {
    expect(parseShare('#Wordle 1,063 4/6*' + grid)).toEqual({ gameId: 'wordle', score: 4, failed: false });
  });
  it('parses fail as 7', () => {
    expect(parseShare('Wordle 1571 X/6*')).toEqual({ gameId: 'wordle', score: 7, failed: true });
  });
  it('tolerates surrounding whitespace and case', () => {
    expect(parseShare('  \n wordle 1,064 2/6\n\n')).toEqual({ gameId: 'wordle', score: 2, failed: false });
  });
  it('rejects out-of-range score', () => {
    expect(() => parseShare('Wordle 1571 9/6')).toThrow(ParseError);
  });
});

describe('flagle', () => {
  it('parses a score', () => {
    expect(parseShare('#Flagle #123 3/6\n🟩⬜⬜\n🟩🟩🟩')).toEqual({ gameId: 'flagle', score: 3, failed: false });
  });
  it('parses a fail as 7', () => {
    expect(parseShare('Flagle X/6')).toEqual({ gameId: 'flagle', score: 7, failed: true });
  });
  it('rejects without score', () => {
    expect(() => parseShare('Flagle is fun')).toThrow(ParseError);
  });
});

describe('globle', () => {
  it('parses = N', () => {
    expect(parseShare('🌎 Oct 1, 2026 🌍\n🟥🟧🟨🟩 = 4')).toEqual({ gameId: 'globle', score: 4, failed: false });
  });
  it('ignores streak line (real header format)', () => {
    expect(parseShare('🌎 May 12, 2024 🌍\n🔥 8 | Avg. Guesses: 5.25\n🟨🟧🟥🟩 = 6')).toEqual({
      gameId: 'globle',
      score: 6,
      failed: false,
    });
  });
  it('is case-insensitive and surrounded by whitespace', () => {
    expect(parseShare('\n  Globle\n🟩 = 1  \n')).toEqual({ gameId: 'globle', score: 1, failed: false });
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
    expect(parseShare(text)).toEqual({ gameId: 'countryle', score, failed: false });
  });
  it('rejects without count', () => {
    expect(() => parseShare('Countryle rocks')).toThrow(ParseError);
  });
  const rows = '🟩🟨⬜⬜🟩🟩\n🟩🟩🟩🟩🟩🟩';
  it('parses the real solved share', () => {
    const text = `#Countryle 1234\nGuessed in 3 tries.\n\n${rows}\n\nhttps://countryle.com`;
    expect(parseShare(text)).toEqual({ gameId: 'countryle', score: 3, failed: false });
  });
  it('parses the real gave-up share as a fail with a penalty of at least 10', () => {
    const text = `#Countryle 1234\nGave up after 5 tries.\n\n${rows}\n🏳️🏳️🏳️🏳️🏳️\n`;
    expect(parseShare(text)).toEqual({ gameId: 'countryle', score: 10, failed: true });
  });
  it('gave-up penalty is tries + 1 when that exceeds 10', () => {
    expect(parseShare('#Countryle 1234\nGave up after 12 tries.\n')).toEqual({ gameId: 'countryle', score: 13, failed: true });
  });
});

describe('detection order', () => {
  it('countryle with globe emoji line stays countryle', () => {
    expect(parseShare('Countryle 🌎 Oct 1 🌍\nI got it in 4 tries')).toEqual({ gameId: 'countryle', score: 4, failed: false });
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

describe('poople', () => {
  const share = 'Poople #412 5/4\n⬜🟫⬜⬜\n⬜🟫🟫⬜\n🟫🟫🟫⬜\n🟫🟫🟫🟫\n https://poople.io/';
  it('parses the share text (score is guesses used)', () => {
    expect(parseShare(share)).toEqual({ gameId: 'poople', score: 5, failed: false });
  });
  it('parses with surrounding whitespace', () => {
    expect(parseShare(`\n\n  ${share}  \n`)).toEqual({ gameId: 'poople', score: 5, failed: false });
  });
  it('rejects a malformed share', () => {
    expect(() => parseShare('Poople is fun')).toThrow(ParseError);
    expect(() => parseShare('Poople #412 /4')).toThrow(ParseError);
  });
  it('parses a score of 1 and a share without the trailing URL', () => {
    expect(parseShare('Poople #7 1/1\n🟫🟫🟫🟫')).toEqual({ gameId: 'poople', score: 1, failed: false });
  });
  it('does not cross-parse with other games', () => {
    expect(parseShare(share).gameId).toBe('poople');
    const others = [
      ['Wordle 1,064 4/6' + grid, 'wordle'],
      ['Flagle #123 3/6\n🟩⬜⬜', 'flagle'],
      ['Countryle: I got it in 4 tries', 'countryle'],
      ['Globle 🌎 = 4', 'globle'],
      ['🌎 Oct 1 🌍\n🟥🟧🟨🟩 = 4', 'globle'],
    ];
    for (const [text, id] of others) expect(parseShare(text).gameId).toBe(id);
  });
});
