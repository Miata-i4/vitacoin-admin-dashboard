const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get all transactions with user details
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
  }
});

// Get transactions for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch user transactions', details: err.message });
  }
});

// Create a new transaction and update user coins
router.post('/', async (req, res) => {
  try {
    const { userId, type, amount, description } = req.body;
    
    // Validation
    if (!userId || !type || amount === undefined) {
      return res.status(400).json({ error: 'UserId, type, and amount are required' });
    }
    
    if (!['reward', 'penalty'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "reward" or "penalty"' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create transaction
    const newTransaction = new Transaction({ userId, type, amount, description });
    const savedTransaction = await newTransaction.save();
    
    // Update user coins
    const coinChange = type === 'reward' ? parseInt(amount) : -parseInt(amount);
    user.coins += coinChange;
    await user.save();
    
    // Populate user details for response
    await savedTransaction.populate('userId', 'username email');
    
    res.status(201).json({
      transaction: savedTransaction,
      userNewBalance: user.coins
    });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create transaction', details: err.message });
  }
});

module.exports = router;
