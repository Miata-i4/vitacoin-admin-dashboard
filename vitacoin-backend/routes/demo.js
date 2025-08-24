const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const RewardConfig = require('../models/RewardConfig');

// POST initialize demo data
router.post('/initialize', async (req, res) => {
  try {
    console.log('Initializing demo data...');
    
    // Create demo users if they don't exist
    const demoUsers = [
      { username: 'alice_demo', email: 'alice@vitacoin.demo', coins: 100 },
      { username: 'bob_demo', email: 'bob@vitacoin.demo', coins: 150 },
      { username: 'charlie_demo', email: 'charlie@vitacoin.demo', coins: 75 }
    ];
    
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        await User.create(userData);
      }
    }
    
    // Create demo reward configs if they don't exist
    const demoConfigs = [
      { activityType: 'login', rewardValue: 10, penaltyValue: 0 },
      { activityType: 'quiz_complete', rewardValue: 25, penaltyValue: 5 },
      { activityType: 'daily_goal', rewardValue: 50, penaltyValue: 10 }
    ];
    
    for (const configData of demoConfigs) {
      await RewardConfig.findOneAndUpdate(
        { activityType: configData.activityType },
        configData,
        { upsert: true, new: true }
      );
    }
    
    res.json({
      message: 'Demo data initialized successfully',
      users: demoUsers.length,
      configs: demoConfigs.length
    });
  } catch (error) {
    console.error('Error initializing demo:', error);
    res.status(500).json({ 
      error: 'Failed to initialize demo data',
      message: error.message 
    });
  }
});

// POST simulate activity
router.post('/simulate-activity', async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(400).json({ error: 'No users found. Initialize demo data first.' });
    }
    
    const configs = await RewardConfig.find();
    if (configs.length === 0) {
      return res.status(400).json({ error: 'No reward configs found. Initialize demo data first.' });
    }
    
    // Pick random user and config
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomConfig = configs[Math.floor(Math.random() * configs.length)];
    
    // Create transaction
    const transaction = await Transaction.create({
      userId: randomUser._id,
      type: 'reward',
      amount: randomConfig.rewardValue,
      description: `${randomConfig.activityType} completed`
    });
    
    // Update user coins
    randomUser.coins += randomConfig.rewardValue;
    await randomUser.save();
    
    res.json({
      message: 'Activity simulated successfully',
      transaction: transaction
    });
  } catch (error) {
    console.error('Error simulating activity:', error);
    res.status(500).json({ 
      error: 'Failed to simulate activity',
      message: error.message 
    });
  }
});

// POST simulate purchase
router.post('/simulate-purchase', async (req, res) => {
  try {
    const users = await User.find({ coins: { $gt: 20 } }); // Users with more than 20 coins
    if (users.length === 0) {
      return res.status(400).json({ error: 'No users with enough coins found.' });
    }
    
    // Pick random user
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const purchaseAmount = Math.floor(Math.random() * 30) + 10; // 10-40 coins
    
    // Create transaction
    const transaction = await Transaction.create({
      userId: randomUser._id,
      type: 'penalty',
      amount: purchaseAmount,
      description: 'Store purchase'
    });
    
    // Update user coins
    randomUser.coins = Math.max(0, randomUser.coins - purchaseAmount);
    await randomUser.save();
    
    res.json({
      message: 'Purchase simulated successfully',
      transaction: transaction
    });
  } catch (error) {
    console.error('Error simulating purchase:', error);
    res.status(500).json({ 
      error: 'Failed to simulate purchase',
      message: error.message 
    });
  }
});

// GET demo stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalCoinsInCirculation = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$coins' } } }
    ]);
    
    const topUsers = await User.find().sort({ coins: -1 }).limit(5);
    const recentActivity = await Transaction.find()
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      totalUsers,
      totalTransactions,
      totalCoinsInCirculation: totalCoinsInCirculation[0]?.total || 0,
      topUsers,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching demo stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch demo stats',
      message: error.message 
    });
  }
});

module.exports = router;
