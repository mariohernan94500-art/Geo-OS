import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./geo.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT,
      detail TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export function logEvent(event, detail) {
  db.run(
    `INSERT INTO logs (event, detail) VALUES (?, ?)`,
    [event, detail]
  );
}
