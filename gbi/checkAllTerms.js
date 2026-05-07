const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/gbiDB').then(async () => {
    try {
        const settings = await mongoose.connection.collection('settings').findOne({});
        console.log('=== SETTINGS ===');
        console.log('currentTerm:', settings.currentTerm);
        console.log('terms array:', settings.terms);
        
        // Show all distinct terms in each collection
        const dTerms = await mongoose.connection.collection('deacons').distinct('term');
        const mTerms = await mongoose.connection.collection('mezemrans').distinct('term');
        const stTerms = await mongoose.connection.collection('substituteteachers').distinct('term');
        const slTerms = await mongoose.connection.collection('substituteleaders').distinct('term');
        const usersTerms = await mongoose.connection.collection('users').distinct('term');
        
        console.log('\n=== DISTINCT TERMS IN EACH COLLECTION ===');
        console.log('Deacons:', dTerms);
        console.log('Mezemrans:', mTerms);
        console.log('SubstituteTeachers:', stTerms);
        console.log('SubstituteLeaders:', slTerms);
        console.log('Users (execs):', usersTerms);

    } catch(e) { console.error(e); }
    process.exit(0);
});
