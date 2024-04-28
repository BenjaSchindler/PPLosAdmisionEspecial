// Import the Mongoose library for MongoDB connection
const mongoose = require('mongoose');

// Define an asynchronous function to connect to databases
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

// Export the connectDB function for use in other modules
module.exports = connectDB;