const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mulugetaketemaw2_db_user:pMcLXsSBIUP7PlCT@cluster0.v6u6gau.mongodb.net/gbiDB?retryWrites=true&w=majority";

const checkUsersComprehensive = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const searchEmail = 'mule1';
    const users = await User.find({ 
      email: { $regex: new RegExp('^' + searchEmail + '$', 'i') } 
    });

    console.log(`Found ${users.length} users matching '${searchEmail}':`);
    for (const u of users) {
      const isMatch = await u.comparePassword('1234');
      console.log(`- ID: ${u._id}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Role: ${u.role}`);
      console.log(`  isActive: ${u.isActive}`);
      console.log(`  isApproved: ${u.isApproved}`);
      console.log(`  Password '1234' match: ${isMatch}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkUsersComprehensive();
