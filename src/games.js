export const GAMES = [
  { id: 'wordle', name: 'Wordle', failScore: 7 },
  { id: 'countryle', name: 'Countryle', failScore: null },
  { id: 'globle', name: 'Globle', failScore: null },
  { id: 'flagle', name: 'Flagle', failScore: 7 },
  { id: 'poople', name: 'Poople', failScore: null },
];

export function getGame(id) {
  return GAMES.find((g) => g.id === id);
}

const WORDLE_EPOCH_MS = Date.UTC(2021, 5, 19); // Wordle #0
const DAY_MS = 24 * 60 * 60 * 1000;

// Date (YYYY-MM-DD) of Wordle puzzle number n.
export function wordleDate(n) {
  return new Date(WORDLE_EPOCH_MS + n * DAY_MS).toISOString().slice(0, 10);
}

export class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParseError';
  }
}

const fromTries = (v) => Number(v);
const fromSix = (v) => (v.toUpperCase() === 'X' ? 7 : Number(v));

// Globle's real share starts "🌎 date 🌍" with no game name, hence the emoji detect.
// Order matters only for detection priority; each entry detects and reads its own score.
const PARSERS = [
  { id: 'wordle', detect: /wordle/i, score: /wordle\s+[\d,.]+\s+([1-6xX])\/6/i, map: fromSix, hint: 'e.g. "Wordle 1,571 4/6"' },
  { id: 'flagle', detect: /flagle/i, score: /(?<![\d])([1-6xX])\/6/i, map: fromSix, hint: 'e.g. "Flagle 4/6"' },
  { id: 'countryle', detect: /countryle/i, score: /(\d+)\s+(?:tries|try|guesses|guess)\b/i, map: fromTries, hint: 'e.g. "in 4 tries"' },
  { id: 'globle', detect: /globle|(?=[\s\S]*=\s*\d)[🌎🌍🌏][^\n]*[🌎🌍🌏]/iu, score: /=\s*(\d+)/, map: fromTries, hint: 'e.g. "🟥🟧🟨🟩 = 4"' },
  { id: 'poople', detect: /poople/i, score: /poople\s+#\d+\s+(\d+)\/\d+/i, map: fromTries, hint: 'e.g. "Poople #412 5/4"' },
];

export function parseShare(text) {
  if (typeof text !== 'string' || !text.trim()) throw new ParseError('Paste a share text to parse.');
  const parser = PARSERS.find((p) => p.detect.test(text));
  if (!parser) throw new ParseError('Could not detect the game (expected Wordle, Countryle, Globle, Flagle or Poople).');
  const m = text.match(parser.score);
  const name = getGame(parser.id).name;
  if (!m) throw new ParseError(`Detected ${name} but could not read the score (${parser.hint}).`);
  let score = parser.map(m[1]);
  if (!Number.isInteger(score) || score < 1) throw new ParseError(`Detected ${name} but the score is invalid.`);
  let failed = false;
  if (parser.id === 'wordle' || parser.id === 'flagle') failed = m[1].toUpperCase() === 'X';
  if (parser.id === 'countryle' && /gave up/i.test(text)) {
    failed = true;
    score = Math.max(score + 1, 10); // a give-up never averages better than a real solve under 10
  }
  const result = { gameId: parser.id, score, failed };
  if (parser.id === 'wordle') result.puzzle = Number(text.match(/wordle\s+([\d,.]+)\s+[1-6x]\/6/i)[1].replace(/[,.]/g, ''));
  return result;
}
