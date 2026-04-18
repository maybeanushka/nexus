const sqlite3 = require('better-sqlite3');
const db = sqlite3('nexus.db');
const users = db.prepare("SELECT * FROM users WHERE email = 'komal@gmail.com'").all();
console.log('User:', JSON.stringify(users, null, 2));
if (users.length > 0) {
    const apps = db.prepare("SELECT * FROM applications WHERE student_id = ?").all(users[0].id);
    console.log('Apps:', JSON.stringify(apps, null, 2));
}
db.close();
