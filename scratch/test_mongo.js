const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing required environment variable: MONGODB_URI");
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
.then(() => {
  process.exit(0);
})
.catch(err => {
  console.error("FAILURE: Could not connect to MongoDB.");
  console.error("Error Code:", err.code);
  console.error("Error Message:", err.message);
  process.exit(1);
});
