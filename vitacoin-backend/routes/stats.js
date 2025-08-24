const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      rewardTransactions,
      penaltyTransactions,
      totalCoinsDistributed
    ] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments({ type: 'reward' }),
      Transaction.countDocuments({ type: 'penalty' }),
      Transaction.aggregate([
        { $match: { type: 'reward' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const coinsDistributed = totalCoinsDistributed[0]?.total || 0;

    res.json({
      totalUsers,
      totalTransactions,
      rewardTransactions,
      penaltyTransactions,
      totalCoinsDistributed: coinsDistributed,
      averageCoinsPerUser: totalUsers > 0 ? Math.round(coinsDistributed / totalUsers) : 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
});

module.exports = router;
