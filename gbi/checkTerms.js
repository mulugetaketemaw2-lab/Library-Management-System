const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gbiDB').then(async () => {
    try {
        const dCount = await mongoose.connection.collection('deacons').countDocuments({ term: '2018 E.C' });
        const dCountNull = await mongoose.connection.collection('deacons').countDocuments({ term: { $exists: false } });
        const dCountStringLog = await mongoose.connection.collection('deacons').distinct('term');
        
        const tCount = await mongoose.connection.collection('substituteteachers').countDocuments({ term: '2018 E.C' });
        const tCountNull = await mongoose.connection.collection('substituteteachers').countDocuments({ term: { $exists: false } });
        const tCountStringLog = await mongoose.connection.collection('substituteteachers').distinct('term');
        
        const lCount = await mongoose.connection.collection('substituteleaders').countDocuments({ term: '2018 E.C' });
        const lCountStringLog = await mongoose.connection.collection('substituteleaders').distinct('term');
        
        console.log('Deacons 2018:', dCount, 'Null:', dCountNull, 'Terms:', dCountStringLog);
        console.log('Teachers 2018:', tCount, 'Null:', tCountNull, 'Terms:', tCountStringLog);
        console.log('Leaders 2018:', lCount, 'Terms:', lCountStringLog);
    } catch(e) { console.error(e); }
    process.exit(0);
});
