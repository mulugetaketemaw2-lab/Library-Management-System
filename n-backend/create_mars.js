const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fix() {
  await mongoose.connect(process.env.MONGO_URI, { tlsInsecure: true });
  const hash = await bcrypt.hash('1234', 10); // temporary password
  await User.findOneAndUpdate(
    { username: 'mars' },
    { name: 'Mars User', username: 'mars', password: hash, role: 'student', approved: true },
    { upsert: true, new: true }
  );
  console.log('User mars created/updated and approved with password 1234');
  mongoose.connection.close();
}
fix();
