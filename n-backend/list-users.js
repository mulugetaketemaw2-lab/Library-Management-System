const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { tlsInsecure: true })
  .then(async () => {
    const users = await User.find({}, { username: 1, role: 1, name: 1 });
    console.log('Users in DB:', JSON.stringify(users, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
