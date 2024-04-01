const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost/MyApp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MyApp database');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;