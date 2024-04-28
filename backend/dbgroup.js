// Import the Mongoose library for MongoDB connection
const mongoose = require('mongoose');

// Define a function to connect to the 'GroupDB' database
const connectDBgroups = () => {
  mongoose.connect('mongodb://localhost/GroupDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.once('open', () => {
    console.log('Connected to GroupDB database');
  });
};

// Export the connectDBgroups function for use in other modules
module.exports = connectDBgroups;