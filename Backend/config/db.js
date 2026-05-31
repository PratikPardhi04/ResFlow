const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connect to MongoDB with retry logic.
 * Mongoose 7+ uses the new connection string parser and unified topology by default.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Mongoose 7+ options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    // Retry after 5 seconds in production, exit in development
    if (env.IS_PRODUCTION) {
      console.log('   Retrying in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB();
    }
    process.exit(1);
  }
};

module.exports = connectDB;
