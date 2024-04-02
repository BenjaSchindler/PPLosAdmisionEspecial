const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost/MyApp');
    console.log('Connected to MyApp database');

    await mongoose.createConnection('mongodb://localhost/GroupDB');
    console.log('Connected to GroupDB database');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;