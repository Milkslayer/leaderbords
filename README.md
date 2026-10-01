# Daily Leaderboard

Self-hosted leaderboard for daily puzzle games (Wordle, Countryle, Globle, Flagle). An admin pastes each
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
| `TZ` | system (`Europe/London` in compose) | Defines what "today" means. |

## Adding a new game

1. Add an entry to `GAMES` in `src/games.js` (`id`, `name`, `failScore`, which is `null` if the game has no fail).
2. Add a matching entry to the `PARSERS` table in the same file (`detect` regex, `score` regex, `map`, `hint`).
3. Add test cases to `test/games.test.js` using real share text.
