const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/gbiDB').then(async () => {
    try {
        const term = '2018 E.C';

        // Update all core collections to use this term
        const dRes = await mongoose.connection.collection('deacons').updateMany({}, { $set: { term: term } });
        const mRes = await mongoose.connection.collection('mezemrans').updateMany({}, { $set: { term: term } });
        const stRes = await mongoose.connection.collection('substituteteachers').updateMany({}, { $set: { term: term } });
        const slRes = await mongoose.connection.collection('substituteleaders').updateMany({}, { $set: { term: term } });
        const memRes = await mongoose.connection.collection('members').updateMany({}, { $set: { term: term } });

        console.log(`Updated all Deacons to ${term}:`, dRes.modifiedCount);
        console.log(`Updated all Mezemrans to ${term}:`, mRes.modifiedCount);
        console.log(`Updated all Substitute Teachers to ${term}:`, stRes.modifiedCount);
        console.log(`Updated all Substitute Leaders to ${term}:`, slRes.modifiedCount);
        console.log(`Updated all Members to ${term}:`, memRes.modifiedCount);

        // Also update settings.terms to only include the current term, effectively deleting the "out of setting" terms from the dropdown history
        const termUpdateRes = await mongoose.connection.collection('settings').updateMany({}, {
            $set: { terms: [term], currentTerm: term }
        });
        
        console.log("Cleared old terms history from settings:", termUpdateRes.modifiedCount);

    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
