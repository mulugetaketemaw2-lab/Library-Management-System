const mongoose = require('mongoose');
const Finance = require('./models/Finance');
require('dotenv').config();

const findAndDelete = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/gbi');
    console.log('Connected to MongoDB');

    const records = await Finance.find({
      description: { $in: ['ከዳቦ ሽያጭ የተገኘ', 'የተሰበሰበ'] },
      amount: { $in: [2000, 1000] }
    });

    console.log(`Found ${records.length} records:`);
    records.forEach(r => console.log(`ID: ${r._id}, Description: ${r.description}, Amount: ${r.amount}`));

    if (records.length > 0) {
      const result = await Finance.deleteMany({
        _id: { $in: records.map(r => r._id) }
      });
      console.log(`Successfully deleted ${result.deletedCount} records.`);
    } else {
      console.log('No matching records found.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

findAndDelete();
