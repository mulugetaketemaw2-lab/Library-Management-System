const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'librarian', 'student'], default: 'student' },
  memberId:  { type: String, default: '' },
  email:     { type: String, default: '' },
  address:   { type: String, default: '' },
  approved:  { type: Boolean, default: false },
  is_blocked: { type: Boolean, default: false },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model('User', userSchema);
