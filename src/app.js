import crypto from 'node:crypto';
import express from 'express';
import { GAMES, getGame, parseShare, ParseError, wordleDate } from './games.js';
import { periodStart, gameBoard, overallBoard } from './leaderboard.js';
import { overallPage, gamePage, loginPage, adminPage } from './views.js';

const PERIODS = ['today', 'week', 'all'];
const COOKIE = 'admin';

function validDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function parseCookies(header) {
  const out = {};
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

export function createApp({ db, adminPassword, sessionSecret, today }) {
  const app = express();
  app.use(express.urlencoded({ extended: false }));

  const token = crypto.createHmac('sha256', sessionSecret).update('admin').digest('hex');
  const safeEqual = (a, b) => {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length && crypto.timingSafeEqual(x, y);
  };
  const isAdmin = (req) => safeEqual(parseCookies(req.headers.cookie)[COOKIE] ?? '', token);
  const requireAdmin = (req, res, next) => (isAdmin(req) ? next() : res.redirect('/login'));

  const periodOf = (req) => (PERIODS.includes(req.query.period) ? req.query.period : 'week');
  const rowsFor = (period) => db.resultsSince(periodStart(period, today()), today());

  app.get('/', (req, res) => {
    const period = periodOf(req);
    res.send(overallPage({ period, board: overallBoard(rowsFor(period)) }));
  });

  app.get('/game/:id', (req, res) => {
    const game = getGame(req.params.id);
    if (!game) return res.status(404).send('Game not found');
    const period = periodOf(req);
    res.send(gamePage({ game, period, board: gameBoard(rowsFor(period), game.id) }));
  });

  app.get('/login', (req, res) => res.send(loginPage()));

  app.post('/login', (req, res) => {
    if (!safeEqual(req.body?.password ?? '', adminPassword)) {
      return res.status(401).send(loginPage({ error: 'Wrong password' }));
    }
    res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax' });
    res.redirect(303, '/admin');
  });

  app.post('/logout', (req, res) => {
    res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax' });
    res.redirect(303, '/login');
  });

  const renderAdmin = (res, { status = 200, error, form } = {}) =>
    res.status(status).send(
      adminPage({ players: db.listPlayers(), results: db.recentResults(50), today: today(), error, form }),
    );

  app.get('/admin', requireAdmin, (req, res) => renderAdmin(res));

  app.post('/admin/results', requireAdmin, (req, res) => {
    const { playerId, date, text } = req.body ?? {};
    const form = { playerId, date, text };
    const fail = (error) => renderAdmin(res, { status: 400, error, form });
    const player = db.listPlayers().find((p) => String(p.id) === String(playerId));
    if (!player) return fail('Select a valid player');
    if (!validDate(date)) return fail('Date must be a valid YYYY-MM-DD');
    if (date > today()) return fail("Date can't be in the future");
    let parsed;
    try {
      parsed = parseShare(text);
    } catch (err) {
      if (err instanceof ParseError) return fail(err.message);
      throw err;
    }
    if (parsed.gameId === 'wordle') {
      const puzzleDate = wordleDate(parsed.puzzle);
      if (puzzleDate !== date) return fail(`This is Wordle #${parsed.puzzle}, which is for ${puzzleDate}.`);
    }
    db.upsertResult({ playerId: player.id, game: parsed.gameId, date, score: parsed.score, raw: text, failed: parsed.failed });
    res.redirect(303, '/admin');
  });

  app.post('/admin/players', requireAdmin, (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    if (!name) return renderAdmin(res, { status: 400, error: 'Name is required' });
    try {
      db.addPlayer(name);
    } catch (err) {
      if (err.message === 'Player already exists') return renderAdmin(res, { status: 400, error: err.message });
      throw err;
    }
    res.redirect(303, '/admin');
  });

  app.post('/admin/results/:id/delete', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (Number.isInteger(id)) db.deleteResult(id);
    res.redirect(303, '/admin');
  });

  return app;
}
