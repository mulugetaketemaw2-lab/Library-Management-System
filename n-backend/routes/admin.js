const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const Settings = require('../models/Settings');
const { authMiddleware, adminOnly, librarianOnly } = require('../middleware/auth');

// GET settings (Admin Only)
router.get('/settings', authMiddleware, adminOnly, async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json(settings);
});

// PUT update settings (Admin Only)
router.put('/settings', authMiddleware, adminOnly, async (req, res) => {
  const { maxBorrowDays, fineRate } = req.body;
  const settings = await Settings.findOneAndUpdate({}, { maxBorrowDays, fineRate }, { new: true, upsert: true });
  res.json({ message: 'Settings updated', settings });
});

// GET all users (Librarians can see members)
router.get('/users', authMiddleware, librarianOnly, async (req, res) => {
  const users = await User.find({ role: { $in: ['librarian', 'student'] } }, '-password');
  res.json(users.map(u => ({
    id: u._id, name: u.name, username: u.username,
    email: u.email, address: u.address, memberId: u.memberId,
    role: u.role, approved: u.approved, is_blocked: u.is_blocked
  })));
});

// POST create librarian (Admin Only)
router.post('/librarian', authMiddleware, adminOnly, async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password)
    return res.status(400).json({ message: 'All fields required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, username, password: hash, role: 'librarian', approved: true });
    res.json({ message: 'Librarian created' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Username already exists' });
    res.status(500).json({ message: 'Error creating librarian' });
  }
});

// PUT reset password (Librarians/Admins can reset)
router.put('/reset-password/:id', authMiddleware, librarianOnly, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password required' });
  const hash = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(req.params.id, { password: hash });
  res.json({ message: 'Password updated' });
});

// PUT edit user info (Librarians can edit members)
router.put('/users/:id', authMiddleware, librarianOnly, async (req, res) => {
  const { name, username, email, address } = req.body;
  try {
    const update = {};
    if (name)     update.name = name;
    if (username) update.username = username;
    if (email !== undefined)   update.email = email;
    if (address !== undefined) update.address = address;
    await User.findByIdAndUpdate(req.params.id, update);
    res.json({ message: 'User updated' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Username already exists' });
    res.status(500).json({ message: 'Error updating user' });
  }
});

// PUT approve member (Identity Verification)
router.put('/approve/:id', authMiddleware, librarianOnly, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { approved: true });
  res.json({ message: 'Member approved' });
});

// PUT reject member (Librarian can reject)
router.put('/reject/:id', authMiddleware, librarianOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Member rejected and removed' });
});

// PUT block user (Librarian/Admin)
router.put('/block/:id', authMiddleware, librarianOnly, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { is_blocked: true });
  res.json({ message: 'User blocked' });
});

// PUT unblock user (Librarian/Admin)
router.put('/unblock/:id', authMiddleware, librarianOnly, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { is_blocked: false });
  res.json({ message: 'User unblocked' });
});

// POST create member (Manual Registration by Librarian)
router.post('/member', authMiddleware, librarianOnly, async (req, res) => {
  const { name, username, password, email, address } = req.body;
  if (!name || !username || !password)
    return res.status(400).json({ message: 'Name, username and password are required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, username, password: hash, role: 'student', email: email || '', address: address || '', approved: true });
    res.json({ message: 'Member created' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Username already exists' });
    res.status(500).json({ message: 'Error creating member' });
  }
});

// DELETE member (Librarian can remove)
router.delete('/users/:id', authMiddleware, librarianOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Member deleted' });
});

module.exports = router;
