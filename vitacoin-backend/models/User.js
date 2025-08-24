const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  coins: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  // Add more fields as necessary for your user info
});

module.exports = mongoose.model('User', userSchema);
