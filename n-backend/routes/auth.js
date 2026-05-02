const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const crypto  = require('crypto');
const { sendEmail } = require('../services/notificationService');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role)
    return res.status(400).json({ message: 'All fields required' });

  try {
    // Escape special characters in username for safe RegExp
    const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Case-insensitive username lookup
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') }, 
      role 
    });
    
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (role === 'student' && !user.approved)
      return res.status(403).json({ message: 'Your account is pending approval by admin' });

    if (user.is_blocked)
      return res.status(403).json({ message: 'Your account has been suspended. Please contact the library administration.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user._id, name: user.name, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/register  (member self-registration)
router.post('/register', async (req, res) => {
  const { fullName, username, email, password, address } = req.body || {};

  if (!fullName || !username || !email || !password || !address)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      name: fullName,
      username,
      password: hash,
      role: 'student',
      email,
      address,
      approved: false,  // requires admin approval before login
    });
    res.json({ message: 'Registration successful! Please wait for admin approval before logging in.' });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Username already exists' });
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    const subject = "Library Pro: Password Reset Request";
    const text = `Hello ${user.name},\n\nYou requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nThank you,\nLibrary Pro Team`;
    
    await sendEmail(user.email, subject, text);
    res.json({ message: 'Reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Error processing request' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;
