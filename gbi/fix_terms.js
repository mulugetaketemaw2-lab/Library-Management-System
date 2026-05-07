const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Member = require('./models/Member');
const Settings = require('./models/Settings');
const SubstituteTeacher = require('./models/SubstituteTeacher');
const SubstituteLeader = require('./models/SubstituteLeader');

const MONGO_URI = process.env.MONGO_URI;

const fixTerms = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for term fix...");

    // 1. Update Settings
    const settings = await Settings.findOne();
    if (settings && settings.currentTerm === '2019') {
      settings.currentTerm = '2018';
      await settings.save();
      console.log("Fixed currentTerm in Settings to 2018.");
    }
    
    if (settings && settings.currentTerm === '2019 E.C') {
      settings.currentTerm = '2018 E.C';
      await settings.save();
      console.log("Fixed currentTerm in Settings to 2018 E.C.");
    }

    // Reset all users and members to be active
    let userRes = await User.updateMany({}, { $set: { isActive: true } });
    console.log(`Activated ${userRes.modifiedCount} Users.`);
    
    let memberRes = await Member.updateMany({}, { $set: { active: true } });
    console.log(`Activated ${memberRes.modifiedCount} Members.`);

    console.log("Term fix completed.");
    process.exit(0);
  } catch (err) {
    console.error("Error during term fix:", err);
    process.exit(1);
  }
};

fixTerms();
