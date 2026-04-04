'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { generatePetResponse } = require('../ai/llm_client');
const userModel = require('../db/models/user');
const petModel = require('../db/models/pet');
const db = require('../db/database');

function insertMessage(userId, role, content) {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO messages (id, user_id, role, content)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, userId, role, content);
}

router.post('/', async (req, res) => {
  try {
    const { userId, message, chatHistory } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields: userId and message' });
    }

    const user = await userModel.getById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const pet = await petModel.getByUserId(userId);
    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet profile not found' });
    }

    let memories = [];
    try {
      memories = JSON.parse(pet.memories || '[]');
    } catch (_) {
      memories = [];
    }

    const userContext = {
      petName: pet.name,
      petSpeciesAndTraits: pet.species_and_traits,
      memories,
      dayCount: user.day_count,
    };

    const result = await generatePetResponse(userContext, message, chatHistory || []);

    insertMessage(userId, 'user', message);
    if (result.text) {
      insertMessage(userId, 'pet', result.text);
    }

    if (result.type === 'memory_update' && result.newTags) {
      await petModel.updateMemories(userId, result.newTags);
    }

    if (result.type === 'action' && result.action === 'lock_app' && result.finalBlessing) {
      await userModel.updateStatus(userId, 'memorial');
      await petModel.updateFinalBlessing(userId, result.finalBlessing);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Chat Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
