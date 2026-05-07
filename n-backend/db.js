const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { tlsInsecure: true })
  .then(async () => {
    console.log('MongoDB Atlas connected');
    await seedDefaults();
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
  });

async function seedDefaults() {
  const User = require('./models/User');

  // Seed admin
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hash = await bcrypt.hash('13118', 10);
    await User.create({ name: 'Super Admin', username: 'mule', password: hash, role: 'admin', approved: true });
    console.log('Admin created  →  username: mule / password: 13118');
  }

  // Seed librarian
  const libExists = await User.findOne({ username: 'man' });
  if (!libExists) {
    const hash = await bcrypt.hash('123', 10);
    await User.create({ name: 'Admin Librarian', username: 'man', password: hash, role: 'librarian', approved: true });
    console.log('Librarian created  →  username: man / password: 123');
  }

  // Seed settings
  const Settings = require('./models/Settings');
  const settingsExists = await Settings.findOne();
  if (!settingsExists) {
    await Settings.create({ maxBorrowDays: 7, fineRate: 5 });
    console.log('Default settings created: 7 days limit, 5 fine rate');
  }
}

module.exports = mongoose;
