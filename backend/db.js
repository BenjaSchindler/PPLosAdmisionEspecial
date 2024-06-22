const mongoose = require('mongoose');

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) { // Check if not already connected
        try {
            await mongoose.connect('mongodb+srv://benjaschindler2:OEFadkY0VDagp5ci@myapp.dcvh37v.mongodb.net/MyApp');
            console.log('MongoDB connected to MyApp database');
        } catch (error) {
            console.error('MongoDB connection failed:', error.message);
        }
    }
};

module.exports = connectDB;
