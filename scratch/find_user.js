const sqlite3 = require('better-sqlite3');
const db = sqlite3('nexus.db');
const users = db.prepare("SELECT email, password, role FROM users LIMIT 10").all();
db.close();
