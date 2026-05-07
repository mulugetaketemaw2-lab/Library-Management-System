const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected');
    const distinctTerms = await User.distinct('term');
    console.log('Distinct terms before:', distinctTerms);
    
    await User.updateMany({ term: 2019 }, { $set: { term: '2018 E.C' } });
    await User.updateMany({ term: '2019' }, { $set: { term: '2018 E.C' } });
    
    const distinctTermsAfter = await User.distinct('term');
    console.log('Distinct terms after:', distinctTermsAfter);
    process.exit(0);
});
