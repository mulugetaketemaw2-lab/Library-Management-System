const mongoose = require('mongoose');
const Settings = require('./gbi-backend/models/Settings');
const User = require('./gbi-backend/models/User');
const Member = require('./gbi-backend/models/Member');
const Attendance = require('./gbi-backend/models/Attendance');
const AttendanceRecord = require('./gbi-backend/models/AttendanceRecord');
const Finance = require('./gbi-backend/models/Finance');
const Meeting = require('./gbi-backend/models/Meeting');
const Subgroup = require('./gbi-backend/models/Subgroup');
const SubstituteTeacher = require('./gbi-backend/models/SubstituteTeacher');
const SubstituteLeader = require('./gbi-backend/models/SubstituteLeader');
const Deacon = require('./gbi-backend/models/Deacon');

require('dotenv').config({ path: './gbi-backend/.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gbi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  const settings = await Settings.findOne();
  if(!settings) {
    console.log('No settings found!');
    process.exit(1);
  }
  const targetTerm = settings.currentTerm;
  console.log('Target Term (from Admin Settings):', targetTerm);

  const models = { User, Member, Attendance, AttendanceRecord, Finance, Meeting, Subgroup, SubstituteTeacher, SubstituteLeader, Deacon };

  let totalUpdated = 0;
  for (const [name, model] of Object.entries(models)) {
    try {
      const result = await model.updateMany(
        { term: { $exists: true, $ne: targetTerm } },
        { $set: { term: targetTerm } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[${name}] Updated ${result.modifiedCount} records to the global term.`);
        totalUpdated += result.modifiedCount;
      }
    } catch(e) {
      console.error(`Error on ${name}:`, e.message);
    }
  }

  console.log(`\nTotal ${totalUpdated} records migrated to "${targetTerm}".`);

  // Update Settings terms array to ONLY have the targetTerm
  settings.terms = [targetTerm];
  await settings.save();
  console.log(`\nSettings.terms wiped out! It now ONLY contains: ["${targetTerm}"]`);

  console.log('\nMigration Complete.');
  process.exit(0);
}).catch(console.error);
