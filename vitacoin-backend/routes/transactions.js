const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all transactions...');
    const transactions = await Transaction.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    console.log(`Found ${transactions.length} transactions`);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      message: error.message 
    });
  }
});

// POST create new transaction
router.post('/', async (req, res) => {
  try {
    console.log('Creating transaction with data:', req.body);
    
    const { userId, type, amount, description } = req.body;
    
    // Validation
    if (!userId || !type || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'userId, type, and amount are required' 
      });
    }
    
    if (!['reward', 'penalty'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid transaction type',
        message: 'Type must be either "reward" or "penalty"' 
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'Invalid user ID' 
      });
    }
    
    // Create transaction
    const transaction = new Transaction({
      userId,
      type,
      amount: parseInt(amount),
      description: description || `${type} transaction`
    });
    
    const savedTransaction = await transaction.save();
    
    // Update user coins
    if (type === 'reward') {
      user.coins += parseInt(amount);
    } else {
      user.coins = Math.max(0, user.coins - parseInt(amount)); // Don't go negative
    }
    
    await user.save();
    console.log('Transaction created and user updated:', savedTransaction);
    
    // Populate the response
    const populatedTransaction = await Transaction.findById(savedTransaction._id)
      .populate('userId', 'username email');
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(400).json({ 
      error: 'Failed to create transaction',
      message: error.message 
    });
  }
});

module.exports = router;
