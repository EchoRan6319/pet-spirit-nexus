'use strict';

const express = require('express');
const router = express.Router();
const userModel = require('../db/models/user');
const petModel = require('../db/models/pet');

router.post('/create', async (req, res) => {
  try {
    const { nickname, pet } = req.body;
    if (!nickname || !pet) {
      return res.status(400).json({ success: false, error: 'Missing required fields: nickname and pet' });
    }
    if (!pet.name) {
      return res.status(400).json({ success: false, error: 'Missing required field: pet.name' });
    }
    const user = await userModel.create({ nickname });
    const createdPet = await petModel.create({
      user_id: user.id,
      name: pet.name,
      species_and_traits: pet.species_and_traits,
      memories: pet.memories || [],
    });
    res.json({ success: true, data: { userId: user.id, pet: createdPet } });
  } catch (err) {
    console.error('[User Create Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/profile', async (req, res) => {
  try {
    const user = await userModel.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const pet = await petModel.getByUserId(req.params.id);
    let profile = { ...user };
    if (pet) {
      try {
        profile.pet = {
          ...pet,
          memories: JSON.parse(pet.memories || '[]'),
        };
      } catch (_) {
        profile.pet = { ...pet, memories: [] };
      }
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    console.error('[User Profile Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id/daycount', async (req, res) => {
  try {
    const dayCount = await userModel.getDayCount(req.params.id);
    if (dayCount === null) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: { dayCount } });
  } catch (err) {
    console.error('[DayCount Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/farewell', async (req, res) => {
  try {
    const { final_blessing } = req.body;
    if (!final_blessing) {
      return res.status(400).json({ success: false, error: 'Missing required field: final_blessing' });
    }
    await petModel.updateFinalBlessing(req.params.id, final_blessing);
    await userModel.updateStatus(req.params.id, 'memorial');
    res.json({ success: true });
  } catch (err) {
    console.error('[Farewell Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
