const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gbiDB').then(async () => {
    try {
        const updateRes = await mongoose.connection.collection('substituteteachers').updateMany({ term: '2018' }, { $set: { term: '2018 E.C' } });
        console.log('Fixed substituteteachers term from 2018 to 2018 E.C:', updateRes.modifiedCount);
    } catch(e) { console.error(e); }
    process.exit(0);
});
