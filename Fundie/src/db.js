const mongoose = require('mongoose');
const fs = require('fs');

// Helper function to ensure environment variables are defined
const getEnv = (key) => {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
};

const connectDB = async () => {
  try {
    await mongoose.connect(getEnv('DB_URI'));
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message, error.stack);
    fs.appendFileSync('app.log', `MongoDB connection failed: ${error.message}\n${error.stack}\n`);
    // Retry logic
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await mongoose.connect(getEnv('DB_URI'));
        console.log(`MongoDB reconnected successfully on attempt ${i + 1}`);
        break;
      } catch (retryError) {
        console.error(`Retry ${i + 1} for MongoDB connection failed:`, retryError.message, retryError.stack);
        fs.appendFileSync('app.log', `Retry ${i + 1} for MongoDB connection failed: ${retryError.message}\n${retryError.stack}\n`);
        if (i === maxRetries - 1) {
          console.error('All retries failed. Exiting the process.');
          fs.appendFileSync('app.log', 'All retries failed. Exiting the process.\n');
          process.exit(1);
        }
      }
    }
  }
};

module.exports = connectDB;