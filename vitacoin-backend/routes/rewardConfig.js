const express = require('express');
const router = express.Router();
const RewardConfig = require('../models/RewardConfig');

// Get all reward configs
router.get('/', async (req, res) => {
  try {
    const configs = await RewardConfig.find();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update or create reward config for an activity
router.put('/:activityType', async (req, res) => {
  try {
    const { activityType } = req.params;
    const { rewardValue, penaltyValue } = req.body;

    const updatedConfig = await RewardConfig.findOneAndUpdate(
      { activityType },
      { rewardValue, penaltyValue, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json(updatedConfig);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
