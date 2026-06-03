// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // These remove deprecation warnings
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected ✓');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    // Exit process — app can't run without DB
    process.exit(1);
  }
};

module.exports = connectDB;