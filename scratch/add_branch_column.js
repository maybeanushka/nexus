const sqlite3 = require('better-sqlite3');
const db = sqlite3('nexus.db');

try {
    db.prepare("ALTER TABLE users ADD COLUMN branch TEXT").run();
    console.log("Successfully added 'branch' column to 'users' table.");
} catch (e) {
    if (e.message.includes('duplicate column name')) {
        console.log("'branch' column already exists.");
    } else {
        console.error("Error adding column:", e.message);
    }
}

db.close();
