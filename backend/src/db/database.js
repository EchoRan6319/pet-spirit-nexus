'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './data/pet_spirit.db';
const resolvedPath = path.resolve(DB_PATH);
const dbDir = path.dirname(resolvedPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(resolvedPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const migrationPath = path.join(__dirname, 'migrations.sql');
if (fs.existsSync(migrationPath)) {
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  db.exec(migrationSql);
} else {
  console.warn('[DB] migrations.sql not found, skipping initialization');
}

module.exports = db;
