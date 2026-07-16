const sqlite3 = require('better-sqlite3');
const db = sqlite3('nexus.db');
const users = db.prepare("SELECT * FROM users WHERE email = 'komal@gmail.com'").all();
if (users.length > 0) {
    const apps = db.prepare("SELECT * FROM applications WHERE student_id = ?").all(users[0].id);
}
db.close();
