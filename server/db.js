const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function initDb(configDir) {
  const db = await open({
    filename: path.join(configDir, 'wiki.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

module.exports = initDb;