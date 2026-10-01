# Daily Leaderboard — Spec & Plan

Self-hosted leaderboard for daily puzzle games (Wordle, Countryle, Globle, Flagle) for friends at work.
One admin pastes share texts; everyone else views boards. Keep it simple.

## Global Constraints

- **Stack:** Node 24, plain JavaScript ESM (`"type": "module"`), no TypeScript, no build step.
  Deps: `express` (v5), `better-sqlite3`. Dev deps: `vitest`, `supertest`. Nothing else.
- **Rendering:** server-rendered HTML via template-literal functions. One inline `<style>` block, no client JS
  required. Every user-supplied value rendered into HTML goes through an `escapeHtml` helper.
- **Scores:** integer, **lower is better**. Each game defines its parse rules. A failed game (X) scores
  `failScore` for that game.
- **Dates:** stored as `YYYY-MM-DD` strings in server local time (set by `TZ` env). "today" = local date.
  "week" = the 7 days ending today (today and the 6 days before). "all" = every date.
- **One result per (player, game, date).** Re-submitting replaces the score (upsert).
- **Auth:** single admin. Password from env `ADMIN_PASSWORD`. Session = httpOnly, `SameSite=Lax` cookie `admin`
  whose value is `HMAC-SHA256(SESSION_SECRET, "admin")` hex. Compare with `crypto.timingSafeEqual`.
  Viewing boards needs no login. All `/admin*` routes except `GET /login`/`POST /login` require the cookie
  (otherwise redirect to `/login`).
- **Tests:** vitest, `npm test` runs `vitest run`. Tests use an in-memory SQLite DB (`:memory:`).
- **Git:** small commits, short conventional-commit subjects. NEVER add any attribution trailer
  (no `Co-Authored-By`, no "Generated with", no model names) to commit messages.

### Games (src/games.js)

| id | name | detect (case-insensitive) | score | failScore |
|----|------|------|------|------|
| wordle | Wordle | text contains `Wordle` followed by a puzzle number and `N/6` e.g. `Wordle 1,571 4/6` or `Wordle 1571 X/6*` | N (1–6), X → 7 | 7 |
| flagle | Flagle | contains `Flagle` and `N/6` or `X/6` | N, X → 7 | 7 |
| globle | Globle | contains `globle` and `= N` (e.g. `🟥🟧🟨🟩 = 4`) | N | none |
| countryle | Countryle | contains `Countryle` and a guess count like `in 4 tries`, `4 tries`, `in 1 try`, `4 guesses` | N | none |

Real share formats may differ from these examples; the parser task verifies them (see Task 1).

### Leaderboard rules (src/leaderboard.js)

- **Per-game board** for a period: one row per player with ≥1 result in that game in the period:
  `played` (count), `avg` (mean score, rounded to 2 decimals), `wins` (days where the player had the lowest
  score for that game among all players that day; ties all count as wins). Sort: `avg` asc, then `played`
  desc, then name asc.
- **Overall board** for a period: for each (game, date), rank players by score with competition ranking
  (ties share the better rank; next rank skips: scores 2,2,3 → ranks 1,1,3). Points: rank 1 → 3, rank 2 → 2,
  rank 3 → 1, else 0. Row per player who has ≥1 result in the period: `points` (sum), `played` (count of results).
  Sort: points desc, then played desc, then name asc.

### Routes (src/app.js)

- `GET /?period=today|week|all` (default `week`) — overall board, period tabs, links to each game.
- `GET /game/:id?period=…` — per-game board; unknown game → 404.
- `GET /login`, `POST /login` (form field `password`; wrong → 401 re-render with error), `POST /logout`.
- `GET /admin` — form to submit a result (player `<select>`, `date` defaulting to today, `text` textarea),
  form to add a player (`name`), list of the 50 most recent results (player, game, date, score) each with a
  delete button.
- `POST /admin/results` — parse `text`; on parse error re-render `/admin` with the error, status 400; on
  success upsert and redirect 303 to `/admin`.
- `POST /admin/players` — trimmed non-empty unique `name`; duplicate/empty → 400 with error message.
- `POST /admin/results/:id/delete` — delete, redirect 303 to `/admin`.
- Invalid `period` falls back to `week`.

### File structure

```
package.json
src/games.js         GAMES list + parseShare(text) -> { gameId, score } | throws ParseError
src/db.js            openDb(path) -> repository object
src/leaderboard.js   pure functions over result rows
src/views.js         escapeHtml + page render functions (return HTML strings)
src/app.js           createApp({ db, adminPassword, sessionSecret, today }) -> express app
src/server.js        reads env (PORT default 3000, DB_PATH default ./data/leaderboard.db, ADMIN_PASSWORD,
                     SESSION_SECRET — exit with error if either secret is missing), starts app
test/*.test.js
Dockerfile, docker-compose.yml, README.md
```

---

## Task 1: Scaffold + share-text parsers

Files: `package.json`, `src/games.js`, `test/games.test.js`.

- `package.json`: name `daily-leaderboard`, `"type": "module"`, scripts `start` (`node src/server.js`) and
  `test` (`vitest run`), engines node >=24. Install deps listed in Global Constraints.
- `src/games.js` exports:
  - `GAMES`: array of `{ id, name, failScore }` in the order wordle, countryle, globle, flagle
    (`failScore` is `null` where none).
  - `getGame(id)` → game or `undefined`.
  - `class ParseError extends Error`.
  - `parseShare(text)` → `{ gameId, score }`. Detect the game from the table in Global Constraints. Throws
    `ParseError` with a human-readable message when no game is detected or the score can't be read.
- Before finalising regexes, use web search to find real share-text examples for each game and make the
  parsers accept them. Put every real example you find in the tests, and note the sources in your report.
  If you can't find a real example for a game, keep the table's format and say so in your report.
- Tests (TDD): at least, per game, a normal score and (where applicable) a fail; plus surrounding whitespace /
  emoji grid lines; plus unknown text → ParseError; plus Wordle with comma in number and hard-mode `*`.

## Task 2: Database repository

Files: `src/db.js`, `test/db.test.js`.

`openDb(path)` uses better-sqlite3, enables `journal_mode = WAL` (skip for `:memory:`), creates tables if
missing:

```sql
CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE COLLATE NOCASE);
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game TEXT NOT NULL, date TEXT NOT NULL, score INTEGER NOT NULL, raw TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (player_id, game, date)
);
```

Returns an object with:
- `addPlayer(name)` → `{ id, name }`; throws `Error` with message `Player already exists` on duplicate.
- `listPlayers()` → `[{ id, name }]` ordered by name.
- `upsertResult({ playerId, game, date, score, raw })` → upserts on (player_id, game, date).
- `deleteResult(id)`.
- `recentResults(limit)` → `[{ id, playerName, game, date, score }]` newest `created_at` first (tie: id desc).
- `resultsSince(fromDate)` → `[{ playerId, playerName, game, date, score }]` with `date >= fromDate`
  (`fromDate` null → all).
- `close()`.

Tests (TDD) against `:memory:`: add/list, duplicate player (case-insensitive), upsert replaces, delete,
recentResults order, resultsSince filtering.

## Task 3: Leaderboard calculations

Files: `src/leaderboard.js`, `test/leaderboard.test.js`. Pure functions, no DB import.

- `periodStart(period, today)` → `today` for `today`, today minus 6 days for `week`, `null` for `all`
  (dates are `YYYY-MM-DD`; do date math in UTC to avoid DST bugs).
- `gameBoard(rows, gameId)` → `[{ playerName, played, avg, wins }]` per the rules in Global Constraints.
- `overallBoard(rows)` → `[{ playerName, points, played }]` per the rules in Global Constraints.
- `rows` are the shape returned by `resultsSince`.

Tests (TDD): ties in wins, competition ranking (2,2,3 → 3,3,1 points), 4th place gets 0, sorting tiebreaks,
avg rounding, periodStart across a month boundary, empty input → `[]`.

## Task 4: Web app (views + routes + server)

Files: `src/views.js`, `src/app.js`, `src/server.js`, `test/app.test.js`.

- Implement every route in Global Constraints → Routes. `createApp` takes `today` as a function returning
  `YYYY-MM-DD` (so tests can fix the date). Use `express.urlencoded`.
- Views: a shared layout (title, nav: Overall · each game · Admin), period tabs (Today / Week / All time),
  board tables, login page, admin page. Clean, readable, mobile-friendly, dark-on-light, minimal CSS.
  Board empty state: "No results yet".
- `server.js`: per File structure; creates the DB directory if missing.
- Tests (supertest, TDD): public board renders players and points; game 404; period fallback; admin
  redirects to /login without cookie; wrong password 401; login sets cookie and grants /admin; submitting a
  Wordle paste creates a result visible on boards; parse error → 400 with message; add player and duplicate;
  delete result; player names are HTML-escaped (`<script>` name).

## Task 5: Docker + README

Files: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `README.md`.

- Dockerfile: `node:24-slim`, `npm ci --omit=dev`, copy `src`, `ENV NODE_ENV=production DB_PATH=/data/leaderboard.db`,
  `VOLUME /data`, `EXPOSE 3000`, run as `node` user, `CMD ["node","src/server.js"]`. Ensure `/data` is owned by `node`.
- docker-compose.yml: one service `leaderboard`, port `3000:3000`, named volume at `/data`, env
  `ADMIN_PASSWORD`, `SESSION_SECRET`, `TZ` from `.env` (`TZ` default `Europe/London`).
- README: what it is, run locally, run with Docker, env vars, how to add a new game (add to `GAMES` + parse rule + test).
- Verify: `docker build` succeeds and the container serves `/` (run it, curl, stop it, remove it).
