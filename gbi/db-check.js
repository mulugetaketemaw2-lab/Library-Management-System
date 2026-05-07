const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mulugetaketemaw2_db_user:pMcLXsSBIUP7PlCT@ac-djrujng.v6u6gau.mongodb.net/gbiDB?retryWrites=true&w=majority";

const listUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");
    
    const users = await User.find({}, 'name email role isActive isApproved');
    console.log("Total users:", users.length);
    console.log(JSON.stringify(users, null, 2));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err);
  }
};

listUsers();
