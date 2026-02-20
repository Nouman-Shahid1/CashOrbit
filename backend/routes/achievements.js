const express = require('express');
const auth = require('../middleware/auth');
const Achievement = require('../models/Achievement');

const router = express.Router();

// Get all achievements
router.get('/', auth, async (req, res) => {
  try {
    const achievements = await Achievement.find();
    res.json({ achievements });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user achievements
router.get('/user', auth, async (req, res) => {
  try {
    const user = await req.user.populate('achievements');
    res.json({ achievements: user.achievements });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;