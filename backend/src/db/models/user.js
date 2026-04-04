'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('../database');

function create(userData) {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO users (id, nickname, status, day_count, start_date)
    VALUES (?, ?, ?, ?, DATE('now'))
  `);
  stmt.run(
    id,
    userData.nickname || null,
    userData.status || 'active',
    userData.day_count || 1
  );
  return getById(id);
}

function getById(userId) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(userId);
}

function updateDayCount(userId) {
  const stmt = db.prepare(`
    UPDATE users SET day_count = day_count + 1 WHERE id = ?
  `);
  const result = stmt.run(userId);
  if (result.changes === 0) return null;
  const user = getById(userId);
  return user ? user.day_count : null;
}

function getDayCount(userId) {
  const user = getById(userId);
  return user ? user.day_count : null;
}

function updateStatus(userId, status) {
  const validStatuses = ['active', 'memorial'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`);
  }
  const stmt = db.prepare('UPDATE users SET status = ? WHERE id = ?');
  const result = stmt.run(status, userId);
  if (result.changes === 0) return null;
  return getById(userId);
}

module.exports = {
  create,
  getById,
  updateDayCount,
  getDayCount,
  updateStatus,
};
