import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { openDb } from '../src/db.js';

const TODAY = '2026-10-01';
let db, app;

beforeEach(() => {
  db = openDb(':memory:');
  app = createApp({ db, adminPassword: 'pw', sessionSecret: 'secret', today: () => TODAY });
});

async function login() {
  const res = await request(app).post('/login').type('form').send({ password: 'pw' });
  return res.headers['set-cookie'][0].split(';')[0];
}

function seed() {
  const a = db.addPlayer('Alice');
  const b = db.addPlayer('Bob');
  db.upsertResult({ playerId: a.id, game: 'wordle', date: TODAY, score: 3, raw: 'x' });
  db.upsertResult({ playerId: b.id, game: 'wordle', date: TODAY, score: 5, raw: 'x' });
}

describe('public boards', () => {
  it('renders players and points on overall board', async () => {
    seed();
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Alice');
    expect(res.text).toContain('Bob');
    expect(res.text).toContain('Points');
  });
  it('shows empty state', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('No results yet');
  });
  it('renders game board with display name', async () => {
    seed();
    const res = await request(app).get('/game/wordle?period=today');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Wordle');
    expect(res.text).toContain('Alice');
  });
  it('404s unknown game', async () => {
    expect((await request(app).get('/game/nope')).status).toBe(404);
  });
  it('falls back to week for invalid period', async () => {
    const res = await request(app).get('/?period=bogus');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/class="active"[^>]*>Week/);
  });
});

describe('auth', () => {
  it('redirects /admin to /login without cookie', async () => {
    const res = await request(app).get('/admin');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
    expect((await request(app).post('/admin/players').type('form').send({ name: 'x' })).status).toBe(302);
  });
  it('rejects wrong password with 401', async () => {
    const res = await request(app).post('/login').type('form').send({ password: 'no' });
    expect(res.status).toBe(401);
    expect(res.text).toContain('Wrong password');
  });
  it('login sets cookie and grants /admin', async () => {
    const res = await request(app).post('/login').type('form').send({ password: 'pw' });
    expect(res.status).toBe(303);
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/^admin=[0-9a-f]{64}/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    const admin = await request(app).get('/admin').set('Cookie', cookie.split(';')[0]);
    expect(admin.status).toBe(200);
  });
  it('rejects a forged cookie', async () => {
    const res = await request(app).get('/admin').set('Cookie', 'admin=abc');
    expect(res.status).toBe(302);
  });
  it('logout clears cookie', async () => {
    const cookie = await login();
    const res = await request(app).post('/logout').set('Cookie', cookie);
    expect(res.status).toBe(303);
    expect(res.headers['set-cookie'][0]).toMatch(/^admin=;/);
  });
});

describe('admin', () => {
  it('submits a Wordle paste and shows it on boards', async () => {
    const cookie = await login();
    const p = db.addPlayer('Carol');
    const res = await request(app).post('/admin/results').set('Cookie', cookie).type('form')
      .send({ playerId: String(p.id), date: TODAY, text: 'Wordle 1,571 4/6\n⬛🟨⬛⬛⬛' });
    expect(res.status).toBe(303);
    expect(res.headers.location).toBe('/admin');
    const board = await request(app).get('/');
    expect(board.text).toContain('Carol');
    const admin = await request(app).get('/admin').set('Cookie', cookie);
    expect(admin.text).toContain('Wordle');
  });
  it('parse error gives 400 with message', async () => {
    const cookie = await login();
    const p = db.addPlayer('Carol');
    const res = await request(app).post('/admin/results').set('Cookie', cookie).type('form')
      .send({ playerId: String(p.id), date: TODAY, text: 'hello' });
    expect(res.status).toBe(400);
    expect(res.text).toContain('Could not detect the game');
  });
  it('rejects unknown player and bad date', async () => {
    const cookie = await login();
    const p = db.addPlayer('Carol');
    const t = 'Wordle 1,571 4/6';
    expect((await request(app).post('/admin/results').set('Cookie', cookie).type('form')
      .send({ playerId: '999', date: TODAY, text: t })).status).toBe(400);
    expect((await request(app).post('/admin/results').set('Cookie', cookie).type('form')
      .send({ playerId: String(p.id), date: '2026-13-45', text: t })).status).toBe(400);
    expect((await request(app).post('/admin/results').set('Cookie', cookie).type('form')
      .send({ playerId: String(p.id), date: 'nope', text: t })).status).toBe(400);
  });
  it('rejects a future date and keeps it off the boards', async () => {
    const cookie = await login();
    const p = db.addPlayer('Carol');
    const res = await request(app).post('/admin/results').set('Cookie', cookie).type('form')
      .send({ playerId: String(p.id), date: '2026-10-02', text: 'Wordle 1,571 4/6' });
    expect(res.status).toBe(400);
    expect(res.text).toContain("Date can&#39;t be in the future");
    expect(db.resultsSince(null)).toHaveLength(0);
  });
  it('board routes ignore future-dated rows', async () => {
    const p = db.addPlayer('Zed');
    db.upsertResult({ playerId: p.id, game: 'wordle', date: '2026-10-05', score: 1, raw: 'x' });
    const res = await request(app).get('/?period=week');
    expect(res.text).not.toContain('Zed');
  });
  it('adds player; duplicate and empty give 400', async () => {
    const cookie = await login();
    const add = (name) => request(app).post('/admin/players').set('Cookie', cookie).type('form').send({ name });
    expect((await add('  Dave ')).status).toBe(303);
    expect(db.listPlayers().map((p) => p.name)).toEqual(['Dave']);
    const dup = await add('Dave');
    expect(dup.status).toBe(400);
    expect(dup.text).toContain('Player already exists');
    const empty = await add('   ');
    expect(empty.status).toBe(400);
    expect(empty.text).toContain('Name is required');
  });
  it('deletes a result', async () => {
    const cookie = await login();
    seed();
    const [r] = db.recentResults(1);
    const res = await request(app).post(`/admin/results/${r.id}/delete`).set('Cookie', cookie);
    expect(res.status).toBe(303);
    expect(db.recentResults(50)).toHaveLength(1);
  });
  it('escapes player names', async () => {
    const cookie = await login();
    const p = db.addPlayer('<script>alert(1)</script>');
    db.upsertResult({ playerId: p.id, game: 'wordle', date: TODAY, score: 3, raw: 'x' });
    for (const [url, c] of [['/', null], ['/game/wordle', null], ['/admin', cookie]]) {
      const req = request(app).get(url);
      const res = c ? await req.set('Cookie', c) : await req;
      expect(res.text).not.toContain('<script>alert');
      expect(res.text).toContain('&lt;script&gt;');
    }
  });
});

describe('parchment views', () => {
  it('each game page includes its animation', async () => {
    for (const id of ['wordle', 'globle', 'flagle', 'countryle', 'poople']) {
      const res = await request(app).get(`/game/${id}`);
      expect(res.text).toContain(`data-anim="${id}"`);
    }
  });
  it('overall page shows all five showcase cards linking to games', async () => {
    const res = await request(app).get('/');
    for (const id of ['wordle', 'globle', 'flagle', 'countryle', 'poople']) {
      expect(res.text).toMatch(new RegExp(`<a href="/game/${id}"><div class="art"><div class="anim anim-sm" data-anim="${id}"`));
    }
  });
});
