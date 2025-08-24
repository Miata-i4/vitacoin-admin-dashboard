const express = require('express');
const router = express.Router();

// GET all activities (placeholder)
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Activities endpoint working', activities: [] });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ 
      error: 'Failed to fetch activities',
      message: error.message 
    });
  }
});

module.exports = router;
