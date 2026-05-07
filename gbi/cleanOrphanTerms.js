const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/gbiDB').then(async () => {
    try {
        // 1. Show what's there first
        const leaderTerms = await mongoose.connection.collection('substituteleaders').distinct('term');
        console.log('Before - SubstituteLeaders terms:', leaderTerms);

        // 2. Fix any record with exactly '2018' (no E.C) → update to '2018 E.C'
        const r1 = await mongoose.connection.collection('substituteleaders').updateMany({ term: '2018' }, { $set: { term: '2018 E.C' } });
        const r2 = await mongoose.connection.collection('substituteteachers').updateMany({ term: '2018' }, { $set: { term: '2018 E.C' } });
        const r3 = await mongoose.connection.collection('deacons').updateMany({ term: '2018' }, { $set: { term: '2018 E.C' } });
        const r4 = await mongoose.connection.collection('mezemrans').updateMany({ term: '2018' }, { $set: { term: '2018 E.C' } });
        const r5 = await mongoose.connection.collection('users').updateMany({ term: '2018' }, { $set: { term: '2018 E.C' } });

        console.log('Fixed leaders:', r1.modifiedCount);
        console.log('Fixed teachers:', r2.modifiedCount);
        console.log('Fixed deacons:', r3.modifiedCount);
        console.log('Fixed mezemrans:', r4.modifiedCount);
        console.log('Fixed users:', r5.modifiedCount);

        // 3. Remove '2018' from settings.terms array and keep only '2018 E.C'
        const settingsBefore = await mongoose.connection.collection('settings').findOne({});
        console.log('Settings terms before:', settingsBefore.terms);

        await mongoose.connection.collection('settings').updateMany(
            {},
            { $pull: { terms: '2018' } }
        );

        const settingsAfter = await mongoose.connection.collection('settings').findOne({});
        console.log('Settings terms after:', settingsAfter.terms);

        // 4. Verify
        const leaderTermsAfter = await mongoose.connection.collection('substituteleaders').distinct('term');
        console.log('After - SubstituteLeaders terms:', leaderTermsAfter);

    } catch(e) { console.error(e); }
    process.exit(0);
});
