const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Member = require('./models/Member');
const Settings = require('./models/Settings');
const SubstituteTeacher = require('./models/SubstituteTeacher');
const SubstituteLeader = require('./models/SubstituteLeader');

const MONGO_URI = process.env.MONGO_URI;

const checkTerms = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Checking terms...");

    const settings = await Settings.find();
    console.log("Settings terms:", settings.map(s => s.currentTerm));

    const userTerms = await User.distinct('term');
    console.log("User terms:", userTerms);

    const memberTerms = await Member.distinct('term');
    console.log("Member terms:", memberTerms);

    const subTeachTerms = await SubstituteTeacher.distinct('term');
    console.log("Sub Teacher terms:", subTeachTerms);

    const subLeadTerms = await SubstituteLeader.distinct('term');
    console.log("Sub Leader terms:", subLeadTerms);

    // Force update anything containing 2019 using regex
    await User.updateMany({ term: /2019/ }, { $set: { term: '2018 E.C' } });
    await Member.updateMany({ term: /2019/ }, { $set: { term: '2018 E.C' } });
    await Settings.updateMany({ currentTerm: /2019/ }, { $set: { currentTerm: '2018 E.C' } });
    await SubstituteTeacher.updateMany({ term: /2019/ }, { $set: { term: '2018 E.C' } });
    await SubstituteLeader.updateMany({ term: /2019/ }, { $set: { term: '2018 E.C' } });

    console.log("Regex cleanup complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkTerms();
