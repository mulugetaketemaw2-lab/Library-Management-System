const mongoose = require('mongoose');
const Finance = require('./models/Finance');
require('dotenv').config();

const listAll = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/gbi');
    console.log('Connected.');
    
    const records = await Finance.find({
      amount: { $in: [1000, 2000] }
    }).sort({ date: -1 });
    
    console.log(`Found ${records.length} records matching amounts 1000 or 2000.`);
    records.forEach(r => {
      console.log(`ID: ${r._id}`);
      console.log(`  Desc: ${r.description}`);
      console.log(`  Amount: ${r.amount}`);
      console.log(`  Date: ${r.date}`);
      console.log('---');
    });
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
  }
};

listAll();
