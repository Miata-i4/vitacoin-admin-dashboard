const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all users...');
    const users = await User.find().sort({ createdAt: -1 });
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error.message 
    });
  }
});

// POST create new user
router.post('/', async (req, res) => {
  try {
    console.log('Creating user with data:', req.body);
    
    const { username, email } = req.body;
    
    // Validation
    if (!username || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Username and email are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        message: 'Username or email already taken' 
      });
    }
    
    // Create user
    const user = new User({
      username: username.trim(),
      email: email.trim(),
      coins: 0
    });
    
    const savedUser = await user.save();
    console.log('User created successfully:', savedUser);
    
    res.status(201).json({
      message: 'User created successfully',
      user: savedUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ 
      error: 'Failed to create user',
      message: error.message 
    });
  }
});

module.exports = router;
