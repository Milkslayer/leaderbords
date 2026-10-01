# Daily Leaderboard

Self-hosted leaderboard for daily puzzle games (Wordle, Countryle, Globle, Flagle, Poople). An admin pastes each
player's share text, the app parses the score, and public boards rank players for today, the last 7 days,
or all time. Lower scores are better.

## Run locally

Requires Node 24.

```sh
npm install
ADMIN_PASSWORD=secret SESSION_SECRET=long-random-string npm start
```

Open http://localhost:3000. Admin lives at `/admin` (log in at `/login`). Run tests with `npm test`.

## Run with Docker

```sh
cp .env.example .env   # then edit the values
docker compose up -d --build
```

Data is stored in the `leaderboard-data` named volume mounted at `/data`.

## Environment variables

| Variable | Default | Notes |
|----------|---------|-------|
| `ADMIN_PASSWORD` | none | Required. Admin login password. |
| `SESSION_SECRET` | none | Required. Secret used to sign the admin cookie. |
| `PORT` | `3000` | HTTP port. |
| `DB_PATH` | `./data/leaderboard.db` (`/data/leaderboard.db` in Docker) | SQLite file. |
| `TZ` | system (`Europe/Oslo` in compose) | Defines what "today" means and when days roll over. |

## Scoring

Every game is scored by guesses, and lower is better. A **round** is one game on one date.

- **Game boards:** `Avg` is the average score over the period, `Played` is the number of results, and `Wins` is
  the number of rounds where the player had the best non-failed score, in rounds with at least 2 players. Ties all win.
- **Overall board:** in each round, players who didn't fail are ranked by score. 1st gets 3 points, 2nd gets 2 and 3rd gets 1.
  Ties share the better place, and the next place is skipped (2, 2, 3 → 3, 3, 1 points).
  - Failed results score 0 and don't take a place.
  - A round with only one player gives no points to anyone.
  - Total points are summed over the period. Ties are broken by more rounds played, then by name.
- **Fails:** Wordle and Flagle `X/6` count as score 7 (failed). A Countryle "Gave up after N tries" counts as failed, with
  score `max(N + 1, 10)`. Globle and Poople have no fail.
- **Wordle date check:** Wordle #N belongs to 2021-06-19 + N days. A Wordle pasted under the wrong date is rejected.
- **Periods:** Today, the last 7 days including today, and All time.

## Adding a new game

1. Add an entry to `GAMES` in `src/games.js`: `id`, `name`, `url` (the play link on its board page), and
   `failScore` (`null` if the game has no fail).
2. Add a matching entry to the `PARSERS` table in the same file (`detect` regex, `score` regex, `map`, `hint`).
   Detection order matters, so make sure the new game doesn't match other games' share texts, and that theirs don't match it.
3. Add an animation for it in `src/animations.js` (`RENDER` map), with its CSS in `src/styles.js`.
4. Add test cases to `test/games.test.js` using real share text.

## Deploying (Dokploy)

Deploy as an **Application** with build type **Dockerfile** from this repo's `main` branch.

- **Container port:** `3000`.
- **Environment:**
  ```
  ADMIN_PASSWORD=<admin password>
  SESSION_SECRET=<output of: openssl rand -hex 32>
  TZ=Europe/Oslo
  ```
  The app refuses to start without both secrets. Changing `SESSION_SECRET` logs out every admin session.
- **Volume:** mount a persistent volume at `/data`. Without it the database is wiped on every redeploy.
- **Domain:** enable HTTPS with the **Let's Encrypt** certificate provider. Otherwise Traefik serves its self-signed
  default certificate.
- **Watch paths (optional):** `src/**`, `package.json`, `package-lock.json`, `Dockerfile`, `.dockerignore`.

## Backups and upgrades

All data is one SQLite file (`/data/leaderboard.db`, plus `-wal`/`-shm` while running). Copy it before deploying a
new version. Schema changes are applied automatically on startup and can rewrite existing rows. For example, the
`failed` column migration re-scores old Countryle give-ups.

```sh
docker compose cp leaderboard:/data/. ./backup/
```
