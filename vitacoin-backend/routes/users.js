const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid user ID', details: err.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Validation
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }
    
    // Check for existing user
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    
    const newUser = new User({ username, email });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create user', details: err.message });
  }
});

// Update user coins (for rewards/penalties)
router.patch('/:id/coins', async (req, res) => {
  try {
    const { amount, description } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.coins += parseInt(amount);
    await user.save();
    
    res.json({ 
      message: `Updated coins for ${user.username}`, 
      newBalance: user.coins 
    });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update coins', details: err.message });
  }
});

module.exports = router;
