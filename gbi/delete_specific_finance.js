const mongoose = require('mongoose');
const Finance = require('./models/Finance');
require('dotenv').config();

const deleteSpecific = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/gbiDB';
    console.log(`Connecting to ${uri}...`);
    await mongoose.connect(uri);
    console.log('Connected.');
    
    const targets = [
      { description: 'ከዳቦ ሽያጭ የተገኘ', amount: 2000 },
      { description: 'የተሰበሰበ', amount: 1000 }
    ];

    for (const target of targets) {
      const result = await Finance.deleteMany(target);
      console.log(`Deleted ${result.deletedCount} records matching: ${target.description} (${target.amount} ETB)`);
    }

    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
  }
};

deleteSpecific();
