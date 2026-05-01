const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const { authMiddleware, librarianOnly } = require('../middleware/auth');

router.get('/', authMiddleware, librarianOnly, async (req, res) => {
  const members = await User.find({ role: 'student' }, '-password');
  res.json(members.map(m => ({
    id: m._id,
    name: m.name,
    username: m.username,
    email: m.email,
    address: m.address,
    memberId: m.memberId,
    approved: m.approved,
    role: m.role,
  })));
});

router.put('/approve/:id', authMiddleware, librarianOnly, async (req, res) => {
  const { password } = req.body;
  const pw = password || '123';
  const hash = await bcrypt.hash(pw, 10);
  await User.findByIdAndUpdate(req.params.id, { approved: true, password: hash });
  res.json({ message: `Member approved. Password set to: ${pw}` });
});

router.post('/', authMiddleware, librarianOnly, async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) return res.status(400).json({ message: 'All fields required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, username, password: hash, role: 'student' });
    res.json({ message: 'Member added' });
  } catch { res.status(400).json({ message: 'Username already exists' }); }
});

router.delete('/:id', authMiddleware, librarianOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Member deleted' });
});

module.exports = router;
