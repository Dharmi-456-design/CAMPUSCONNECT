const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not defined in environment variables. Database connection will fail until set.');
    return;
  }
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
