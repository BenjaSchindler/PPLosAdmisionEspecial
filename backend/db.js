const mongoose = require('mongoose');

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) { // Check if not already connected
        try {
            await mongoose.connect('mongodb://localhost:27017/MyApp');
            console.log('MongoDB connected to MyApp database');
        } catch (error) {
            console.error('MongoDB connection failed:', error.message);
        }
    }
};

module.exports = connectDB;
