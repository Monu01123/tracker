import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'tracker.db');
export const db = new DatabaseSync(dbPath);

// Enable foreign keys and WAL mode for better concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_color TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      easy_count INTEGER NOT NULL DEFAULT 0,
      medium_count INTEGER NOT NULL DEFAULT 0,
      hard_count INTEGER NOT NULL DEFAULT 0,
      timestamp DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Check if users exist, seed if not
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount && userCount.count === 0) {
    db.exec('BEGIN TRANSACTION;');
    try {
      const insertUser = db.prepare('INSERT INTO users (id, name, avatar_color) VALUES (?, ?, ?)');
      const defaultUsers = [
        { id: 1, name: 'Alex', color: '#00f0ff' },
        { id: 2, name: 'Sam', color: '#10b981' },
        { id: 3, name: 'Jordan', color: '#f59e0b' },
        { id: 4, name: 'Taylor', color: '#ec4899' },
      ];

      for (const u of defaultUsers) {
        insertUser.run(u.id, u.name, u.color);
      }
      db.exec('COMMIT;');
      console.log('Seeded initial 4 team members.');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }
}
