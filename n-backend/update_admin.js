const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function updateAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { tlsInsecure: true });
    console.log('Connected to database');

    const hash = await bcrypt.hash('13118', 10);
    
    // Try to find the old admin 'mar' or any admin role if 'mar' isn't found
    let admin = await User.findOne({ username: 'mar' });
    if (!admin) {
        admin = await User.findOne({ role: 'admin' });
    }

    if (admin) {
      admin.username = 'mule';
      admin.password = hash;
      await admin.save();
      console.log('Admin updated successfully!');
      console.log('New Username: mule');
      console.log('New Password: (updated to 13118)');
    } else {
      console.log('No admin user found to update.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateAdmin();
