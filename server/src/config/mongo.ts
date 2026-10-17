import mongoose from 'mongoose';

export async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[ServiceHub Database] MONGODB_URI not set. Running in persistent store mode with Mongoose schema validation.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('[ServiceHub Database] Successfully connected to MongoDB cluster.');
    return true;
  } catch (err: any) {
    console.warn('[ServiceHub Database] MongoDB connection failed or timed out. Falling back gracefully to persistent store mode:', err.message);
    return false;
  }
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
