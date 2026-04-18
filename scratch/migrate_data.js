const mongoose = require('mongoose');
const sqlite3 = require('better-sqlite3');
const crypto = require('crypto');


const MONGODB_URI = "mongodb://admin:admin%40123@ac-ctfqwjk-shard-00-00.tl4ieoh.mongodb.net:27017,ac-ctfqwjk-shard-00-01.tl4ieoh.mongodb.net:27017,ac-ctfqwjk-shard-00-02.tl4ieoh.mongodb.net:27017/nexus?ssl=true&authSource=admin&retryWrites=true&w=majority";
const db = sqlite3('nexus.db');

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB...");

  // Define models directly for migration
  const User = mongoose.model('User', new mongoose.Schema({ _id: String }, { strict: false }));
  const Application = mongoose.model('Application', new mongoose.Schema({ _id: String }, { strict: false }));
  const Document = mongoose.model('Document', new mongoose.Schema({ _id: String }, { strict: false }));
  const Due = mongoose.model('Due', new mongoose.Schema({ _id: String }, { strict: false }));
  const Transaction = mongoose.model('Transaction', new mongoose.Schema({ _id: String }, { strict: false }));
  const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({ _id: String }, { strict: false }));
  const Session = mongoose.model('Session', new mongoose.Schema({ _id: String }, { strict: false }));

  const tables = [
    { name: 'users', model: User },
    { name: 'applications', model: Application },
    { name: 'documents', model: Document },
    { name: 'dues', model: Due },
    { name: 'transactions', model: Transaction },
    { name: 'audit_logs', model: AuditLog },
    { name: 'sessions', model: Session }
  ];

  for (const table of tables) {
    console.log(`Migrating ${table.name}...`);
    try {
      const rows = db.prepare(`SELECT * FROM ${table.name}`).all();
      for (const row of rows) {
        const mongoDoc = { ...row, _id: row.id };
        delete mongoDoc.id;
        
        // Convert integer dates if any
        if (mongoDoc.created_at && !isNaN(mongoDoc.created_at)) mongoDoc.created_at = new Date(mongoDoc.created_at);
        if (mongoDoc.submitted_at && !isNaN(mongoDoc.submitted_at)) mongoDoc.submitted_at = new Date(mongoDoc.submitted_at);
        if (mongoDoc.reviewed_at && !isNaN(mongoDoc.reviewed_at)) mongoDoc.reviewed_at = new Date(mongoDoc.reviewed_at);
        if (mongoDoc.expires_at && !isNaN(mongoDoc.expires_at)) mongoDoc.expires_at = new Date(mongoDoc.expires_at);

        await table.model.updateOne({ _id: mongoDoc._id }, mongoDoc, { upsert: true });
      }
      console.log(`Successfully migrated ${rows.length} rows from ${table.name}`);
    } catch (e) {
      console.warn(`Could not migrate ${table.name}: ${e.message}`);
    }
  }

  console.log("Migration COMPLETE!");
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
