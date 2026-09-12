import mongoose from 'mongoose';

// Using standard connection string to bypass querySrv ECONNREFUSED DNS issue
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://f2fintech_db_user:F2fin-hrms@ac-rroip3u-shard-00-00.t390pwj.mongodb.net:27017,ac-rroip3u-shard-00-01.t390pwj.mongodb.net:27017,ac-rroip3u-shard-00-02.t390pwj.mongodb.net:27017/whitecoat_club?ssl=true&replicaSet=atlas-lb0u53-shard-0&authSource=admin';

if (!MONGODB_URI.includes('retryWrites=')) {
  MONGODB_URI += (MONGODB_URI.includes('?') ? '&' : '?') + 'retryWrites=false';
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: GlobalMongoose | undefined;
}

let cached: GlobalMongoose = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      retryWrites: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
