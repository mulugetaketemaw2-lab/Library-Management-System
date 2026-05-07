const mongoose = require('mongoose');
const Finance = require('./models/Finance');
require('dotenv').config();

const listAny = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/gbiDB';
    console.log(`Connecting to ${uri}...`);
    await mongoose.connect(uri);
    console.log('Connected.');
    
    // List transactions with matching amounts
    const records = await Finance.find({
      amount: { $in: [1000, 2000] }
    }).sort({ date: -1 });
    
    console.log(`Found ${records.length} records.`);
    records.forEach(r => {
      console.log(`ID: ${r._id} | Desc: ${r.description} | Amount: ${r.amount} | Date: ${r.date}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
  }
};

listAny();
