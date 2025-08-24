const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const RewardConfig = require('../models/RewardConfig');

// Demo data generators
const sampleUsers = [
  { username: 'alice_student', email: 'alice@university.edu' },
  { username: 'bob_employee', email: 'bob@company.com' },
  { username: 'charlie_gamer', email: 'charlie@gaming.net' },
  { username: 'diana_learner', email: 'diana@courses.com' },
  { username: 'evan_shopper', email: 'evan@retail.com' }
];

const sampleActivities = [
  { activityType: 'daily_login', rewardValue: 5, penaltyValue: 2 },
  { activityType: 'quiz_complete', rewardValue: 25, penaltyValue: 10 },
  { activityType: 'course_finish', rewardValue: 100, penaltyValue: 0 },
  { activityType: 'referral', rewardValue: 50, penaltyValue: 0 },
  { activityType: 'purchase', rewardValue: 0, penaltyValue: 0 },
  { activityType: 'daily_goal', rewardValue: 20, penaltyValue: 5 }
];

const purchaseItems = [
  { name: 'Coffee Voucher', cost: 15 },
  { name: 'Movie Ticket', cost: 50 },
  { name: 'Book Discount', cost: 30 },
  { name: 'Premium Course', cost: 200 },
  { name: 'Gift Card', cost: 100 }
];

// Initialize demo data
router.post('/initialize', async (req, res) => {
  try {
    // Clear existing demo data
    await User.deleteMany({ username: { $in: sampleUsers.map(u => u.username) } });
    await RewardConfig.deleteMany({ activityType: { $in: sampleActivities.map(a => a.activityType) } });

    // Create sample users
    const createdUsers = await User.insertMany(sampleUsers.map(user => ({
      ...user,
      coins: Math.floor(Math.random() * 100) + 50 // 50-150 starting coins
    })));

    // Create reward configurations
    await RewardConfig.insertMany(sampleActivities);

    res.json({
      message: 'Demo initialized successfully',
      usersCreated: createdUsers.length,
      configsCreated: sampleActivities.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize demo', details: error.message });
  }
});

// Generate realistic activity simulation
router.post('/simulate-activity', async (req, res) => {
  try {
    const users = await User.find({ username: { $in: sampleUsers.map(u => u.username) } });
    if (users.length === 0) {
      return res.status(400).json({ error: 'No demo users found. Initialize demo first.' });
    }

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const activities = await RewardConfig.find();
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    // 80% success rate for activities
    const isSuccess = Math.random() > 0.2;
    const amount = isSuccess ? randomActivity.rewardValue : randomActivity.penaltyValue;
    const type = isSuccess ? 'reward' : 'penalty';
    
    // Create transaction
    const transaction = new Transaction({
      userId: randomUser._id,
      type,
      amount,
      description: `${isSuccess ? 'Completed' : 'Failed'} ${randomActivity.activityType}`
    });
    await transaction.save();
    
    // Update user coins
    const coinChange = isSuccess ? amount : -amount;
    randomUser.coins = Math.max(0, randomUser.coins + coinChange); // Prevent negative coins
    await randomUser.save();

    res.json({
      user: randomUser.username,
      activity: randomActivity.activityType,
      type,
      amount,
      newBalance: randomUser.coins,
      success: isSuccess
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate activity', details: error.message });
  }
});

// Simulate purchase transaction
router.post('/simulate-purchase', async (req, res) => {
  try {
    const users = await User.find({ username: { $in: sampleUsers.map(u => u.username) } });
    const eligibleUsers = users.filter(user => user.coins >= 15); // Can afford cheapest item
    
    if (eligibleUsers.length === 0) {
      return res.status(400).json({ error: 'No users with sufficient coins for purchase' });
    }

    const randomUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
    const affordableItems = purchaseItems.filter(item => item.cost <= randomUser.coins);
    const randomItem = affordableItems[Math.floor(Math.random() * affordableItems.length)];
    
    // Create purchase transaction
    const transaction = new Transaction({
      userId: randomUser._id,
      type: 'penalty', // Purchase is a coin deduction
      amount: randomItem.cost,
      description: `Purchased: ${randomItem.name}`
    });
    await transaction.save();
    
    // Update user coins
    randomUser.coins -= randomItem.cost;
    await randomUser.save();

    res.json({
      user: randomUser.username,
      item: randomItem.name,
      cost: randomItem.cost,
      newBalance: randomUser.coins
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate purchase', details: error.message });
  }
});

// Get demo statistics
router.get('/stats', async (req, res) => {
  try {
    const demoUsers = await User.find({ username: { $in: sampleUsers.map(u => u.username) } });
    const demoTransactions = await Transaction.find({ 
      userId: { $in: demoUsers.map(u => u._id) } 
    }).populate('userId', 'username');

    const stats = {
      totalUsers: demoUsers.length,
      totalTransactions: demoTransactions.length,
      totalCoinsInCirculation: demoUsers.reduce((sum, user) => sum + user.coins, 0),
      recentActivity: demoTransactions.slice(-10).reverse(),
      topUsers: demoUsers.sort((a, b) => b.coins - a.coins).slice(0, 3)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get demo stats', details: error.message });
  }
});

module.exports = router;