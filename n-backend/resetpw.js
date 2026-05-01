const bcrypt = require('bcryptjs');
const mysql  = require('mysql2');

const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'library_db' });
db.connect();

bcrypt.hash('123', 10).then(hash => {
  db.query("UPDATE users SET password=? WHERE email='admin@library.com'", [hash], (err, r) => {
    if (err) { console.log('ERROR:', err.message); }
    else     { console.log('Password updated to 123. Rows affected:', r.affectedRows); }
    db.end();
  });
});
