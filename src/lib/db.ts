import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.VERCEL
  ? path.join("/tmp", "data.db")
  : path.join(process.cwd(), "data.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notes_expires_at ON notes (expires_at)
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      short_code TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT,
      user_id TEXT
    )
  `);

  // Migrate existing tables that may lack new columns
  try {
    db.exec(`ALTER TABLE urls ADD COLUMN expires_at TEXT`);
  } catch (e: unknown) {
    if (!(e instanceof Error && e.message.includes("duplicate column"))) throw e;
  }

  try {
    db.exec(`ALTER TABLE urls ADD COLUMN user_id TEXT`);
  } catch (e: unknown) {
    if (!(e instanceof Error && e.message.includes("duplicate column"))) throw e;
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls (user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_urls_expires_at ON urls (expires_at)`);
}

initDb();

export { db, initDb };
