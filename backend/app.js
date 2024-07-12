const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const fileRoutes = require('./fileRoutes');
const groupRoutes = require('./groupRoutes');
const chatRoutes = require('./chatRoutes');
const invitationRoutes = require('./invitationRoutes');
const { authenticateToken } = require('./authMiddleware');
const connectDB = require('./db');

// Create an instance of the Express application
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(express.json());

// Define the User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: String,
  photoURL: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Connect to MongoDB
connectDB();

// Google OAuth client setup
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(googleClientId);

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = 'blitzwebapp'; // Replace with your bucket name

// Configure multer for file upload
const storageMulter = multer.memoryStorage();
const upload = multer({ storage: storageMulter });

// Function to upload a file to GCS
const uploadImageToGCS = (file, userId) => {
  return new Promise((resolve, reject) => {
    const blob = storage.bucket(bucketName).file(`${userId}-${Date.now()}-${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', async () => {
      try {
        const [url] = await blob.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        });
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });

    blobStream.end(file.buffer);
  });
};

// User registration route
app.post('/Signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      photoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/542px-Unknown_person.jpg',
    });

    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        photoURL: newUser.photoURL,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login route
app.post('/Login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);

    res.status(200).json({
      token,
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to verify Google token
async function verifyGoogleToken(token) {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: googleClientId,
  });
  const payload = ticket.getPayload();
  return payload;
}

// Google login route
app.post('/googleLogin', async (req, res) => {
  const { googleToken } = req.body;

  try {
    const payload = await verifyGoogleToken(googleToken);
    const userId = payload['sub'];
    const email = payload['email'];
    const photoURL = payload['picture'];
    const username = email.split('@')[0];

    let user = await User.findOne({ email });

    if (!user) {
      const newUser = new User({
        username,
        email,
        password: '',
        photoURL,
      });
      user = await newUser.save();
    } else {
      if (user.photoURL !== photoURL || user.username !== username) {
        user.photoURL = photoURL;
        user.username = username;
        await user.save();
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);

    res.status(200).json({
      token,
      user: {
        _id: user._id.toString(),
        username,
        email: user.email,
        photoURL,
      },
    });
  } catch (error) {
    console.error('Error logging in with Google:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile photo upload route
app.post('/uploadProfilePhoto', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const photoURL = await uploadImageToGCS(req.file, userId);

    const user = await User.findByIdAndUpdate(
      userId,
      { photoURL },
      { new: true }
    );

    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this route in app.js before the final app.listen call
app.get('/api/user/email/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Include file and group routes
app.use('/api/groups', groupRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/invitations', invitationRoutes);

// Start the server
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});

module.exports = { app, User };
