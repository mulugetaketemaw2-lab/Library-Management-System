const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  maxBorrowDays: { type: Number, default: 7 },
  fineRate:      { type: Number, default: 5 }, // amount per day
});

module.exports = mongoose.model('Settings', settingsSchema);
