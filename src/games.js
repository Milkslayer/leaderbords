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
  const score = parser.map(m[1]);
  if (!Number.isInteger(score) || score < 1) throw new ParseError(`Detected ${name} but the score is invalid.`);
  return { gameId: parser.id, score };
}
