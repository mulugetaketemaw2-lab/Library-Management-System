const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI, { tlsInsecure: true });
  const users = await User.find({}, 'name username role approved');
  console.log('All Users:', JSON.stringify(users, null, 2));
  mongoose.connection.close();
}
check();
