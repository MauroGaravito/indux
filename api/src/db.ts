import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/indux';
  await mongoose.connect(uri);
  console.log('Connected to Mongo');
}

