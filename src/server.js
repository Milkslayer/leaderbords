import fs from 'node:fs';
import path from 'node:path';
import { openDb } from './db.js';
import { createApp } from './app.js';

const { ADMIN_PASSWORD, SESSION_SECRET } = process.env;
if (!ADMIN_PASSWORD || !SESSION_SECRET) {
  console.error('ADMIN_PASSWORD and SESSION_SECRET environment variables are required');
  process.exit(1);
}

const port = Number(process.env.PORT) || 3000;
const dbPath = process.env.DB_PATH || './data/leaderboard.db';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const pad = (n) => String(n).padStart(2, '0');
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const db = openDb(dbPath);
const app = createApp({ db, adminPassword: ADMIN_PASSWORD, sessionSecret: SESSION_SECRET, today });
const server = app.listen(port, () => console.log(`Listening on :${port}`));

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => { db.close(); process.exit(0); }));
}
