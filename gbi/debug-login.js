const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mulugetaketemaw2_db_user:pMcLXsSBIUP7PlCT@cluster0.v6u6gau.mongodb.net/gbiDB?retryWrites=true&w=majority";

const checkUser = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({ role: 'super_admin' });
    console.log("Super Admin users found:", users.length);
    
    users.forEach(u => {
      console.log(`Username: ${u.email}, Role: ${u.role}, isActive: ${u.isActive}, isApproved: ${u.isApproved}`);
    });

    const targetUser = await User.findOne({ email: 'mule1' });
    if (targetUser) {
      console.log("User 'mule1' exists.");
      // Test password comparison directly
      const isMatch = await targetUser.comparePassword('1234');
      console.log("Password '1234' match test:", isMatch);
    } else {
      console.log("User 'mule1' NOT found.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking user:", error);
    process.exit(1);
  }
};

checkUser();
