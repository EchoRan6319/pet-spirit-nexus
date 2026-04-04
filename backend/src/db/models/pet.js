'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('../database');

function create(petData) {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO pets (id, user_id, name, species_and_traits, memories)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    petData.user_id,
    petData.name,
    petData.species_and_traits || null,
    JSON.stringify(petData.memories || [])
  );
  return getByUserId(petData.user_id);
}

function getByUserId(userId) {
  const stmt = db.prepare('SELECT * FROM pets WHERE user_id = ?');
  return stmt.get(userId);
}

function updateMemories(userId, newTags) {
  const pet = getByUserId(userId);
  if (!pet) return null;

  let existingMemories = [];
  try {
    existingMemories = JSON.parse(pet.memories || '[]');
  } catch (_) {
    existingMemories = [];
  }

  const merged = [...new Set([...existingMemories, ...newTags])];

  const stmt = db.prepare(`
    UPDATE pets SET memories = ? WHERE user_id = ?
  `);
  stmt.run(JSON.stringify(merged), userId);

  return getByUserId(userId);
}

function updateFinalBlessing(userId, blessing) {
  const stmt = db.prepare(`
    UPDATE pets SET final_blessing = ? WHERE user_id = ?
  `);
  const result = stmt.run(blessing, userId);
  if (result.changes === 0) return null;
  return getByUserId(userId);
}

module.exports = {
  create,
  getByUserId,
  updateMemories,
  updateFinalBlessing,
};
