const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:admin%40123@ac-ctfqwjk-shard-00-00.tl4ieoh.mongodb.net:27017,ac-ctfqwjk-shard-00-01.tl4ieoh.mongodb.net:27017,ac-ctfqwjk-shard-00-02.tl4ieoh.mongodb.net:27017/nexus?ssl=true&authSource=admin&retryWrites=true&w=majority";

console.log("Attempting to connect to MongoDB...");

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
.then(() => {
  console.log("SUCCESS: Connected to MongoDB!");
  process.exit(0);
})
.catch(err => {
  console.error("FAILURE: Could not connect to MongoDB.");
  console.error("Error Code:", err.code);
  console.error("Error Message:", err.message);
  process.exit(1);
});
