const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mulugetaketemaw2_db_user:pMcLXsSBIUP7PlCT@cluster0.v6u6gau.mongodb.net/gbiDB?retryWrites=true&w=majority";

async function fixTerm() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const result = await User.updateMany(
      { role: { $in: ['super_admin', 'admin'] } },
      { term: '2018 E.C' }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} accounts to '2018 E.C' term.`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing terms:", error);
    process.exit(1);
  }
}

fixTerm();
