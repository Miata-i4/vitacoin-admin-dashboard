const mongoose = require('mongoose');

const rewardConfigSchema = new mongoose.Schema({
  activityType: { type: String, required: true, unique: true },
  rewardValue: { type: Number, required: true },
  penaltyValue: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RewardConfig', rewardConfigSchema);
