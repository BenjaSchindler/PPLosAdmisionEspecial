const mongoose = require('mongoose');

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

module.exports = connectDBgroups;