const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const RewardConfig = require('../models/RewardConfig');

// Process activity reward/penalty
router.post('/process', async (req, res) => {
  try {
    const { userId, activityType, success = true } = req.body;
    
    // Validation
    if (!userId || !activityType) {
      return res.status(400).json({ error: 'UserId and activityType are required' });
    }
    
    // Get reward config for this activity
    const config = await RewardConfig.findOne({ activityType });
    if (!config) {
      return res.status(404).json({ error: `No configuration found for activity: ${activityType}` });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Determine reward or penalty
    const isReward = success;
    const amount = isReward ? config.rewardValue : config.penaltyValue;
    const type = isReward ? 'reward' : 'penalty';
    const description = `${isReward ? 'Completed' : 'Failed'} activity: ${activityType}`;
    
    // Create transaction
    const transaction = new Transaction({
      userId,
      type,
      amount,
      description
    });
    await transaction.save();
    
    // Update user coins
    const coinChange = isReward ? amount : -amount;
    user.coins += coinChange;
    await user.save();
    
    res.status(201).json({
      message: `Processed ${activityType} for ${user.username}`,
      type,
      amount,
      userNewBalance: user.coins,
      transaction: transaction._id
    });
    
  } catch (err) {
    res.status(400).json({ error: 'Failed to process activity', details: err.message });
  }
});

module.exports = router;
