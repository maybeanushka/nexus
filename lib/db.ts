import mongoose from 'mongoose';


const MONGODB_URI = "mongodb://admin:admin%40123@ac-ctfqwjk-shard-00-00.tl4ieoh.mongodb.net:27017,ac-ctfqwjk-shard-00-01.tl4ieoh.mongodb.net:27017,ac-ctfqwjk-shard-00-02.tl4ieoh.mongodb.net:27017/nexus?ssl=true&authSource=admin&retryWrites=true&w=majority";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, {
      ...opts,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      family: 4,
    }).then((mongoose) => {
      console.log('✅ MongoDB Protocol Connected Successfully');
      return mongoose;
    }).catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
      if (err.message.includes('ECONNREFUSED')) {
        console.error('👉 TIP: Ensure your IP address is whitelisted in MongoDB Atlas (Network Access).');
      }
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
