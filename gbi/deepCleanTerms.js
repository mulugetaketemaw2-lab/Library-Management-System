const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/gbiDB').then(async () => {
    try {
        const collections = ['members', 'users', 'substituteteachers', 'substituteleaders',
                             'deacons', 'mezemrans', 'finances', 'attendancerecords', 'meetings',
                             'subgroups', 'notifications', 'logs'];
        
        console.log('=== CHECKING ALL COLLECTIONS FOR BARE "2018" TERM ===\n');
        
        for (const col of collections) {
            try {
                const terms = await mongoose.connection.collection(col).distinct('term');
                const hasBare2018 = terms.includes('2018');
                if (terms.length > 0 || hasBare2018) {
                    console.log(`${col}:`, terms);
                }
                
                if (hasBare2018) {
                    const res = await mongoose.connection.collection(col).updateMany(
                        { term: '2018' },
                        { $set: { term: '2018 E.C' } }
                    );
                    console.log(`  → Fixed ${res.modifiedCount} records in ${col}`);
                }
            } catch (e) {
                // collection might not exist
            }
        }
        
        // Also check settings.terms array
        const settings = await mongoose.connection.collection('settings').findOne({});
        console.log('\n=== SETTINGS ===');
        console.log('currentTerm:', settings?.currentTerm);
        console.log('terms:', settings?.terms);
        
        // Pull bare '2018' from settings.terms
        await mongoose.connection.collection('settings').updateMany(
            {},
            { $pull: { terms: '2018' } }
        );
        
        const settingsAfter = await mongoose.connection.collection('settings').findOne({});
        console.log('\nAfter clean - settings.terms:', settingsAfter?.terms);
        
        console.log('\n✅ Done!');
    } catch(e) { console.error(e); }
    process.exit(0);
});
