const express = require('express');
const router = express.Router();
const RewardConfig = require('../models/RewardConfig');

// GET all reward configurations
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all reward configs...');
    const configs = await RewardConfig.find().sort({ updatedAt: -1 });
    console.log(`Found ${configs.length} reward configs`);
    res.json(configs);
  } catch (error) {
    console.error('Error fetching reward configs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch reward configurations',
      message: error.message 
    });
  }
});

// PUT create or update reward configuration
router.put('/:activityType', async (req, res) => {
  try {
    const { activityType } = req.params;
    const { rewardValue, penaltyValue } = req.body;
    
    console.log('Updating reward config:', { activityType, rewardValue, penaltyValue });
    
    // Validation
    if (!activityType || rewardValue === undefined || penaltyValue === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'activityType, rewardValue, and penaltyValue are required' 
      });
    }
    
    const config = await RewardConfig.findOneAndUpdate(
      { activityType: activityType.toLowerCase() },
      { 
        activityType: activityType.toLowerCase(),
        rewardValue: parseInt(rewardValue),
        penaltyValue: parseInt(penaltyValue)
      },
      { 
        new: true, 
        upsert: true, 
        runValidators: true 
      }
    );
    
    console.log('Reward config updated:', config);
    
    res.json({
      message: 'Reward configuration updated successfully',
      config: config
    });
  } catch (error) {
    console.error('Error updating reward config:', error);
    res.status(400).json({ 
      error: 'Failed to update reward configuration',
      message: error.message 
    });
  }
});

module.exports = router;
