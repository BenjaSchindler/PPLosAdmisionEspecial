const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();


const secretKey = process.env.SECRET_KEY;

// Define the User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

// Create an instance of the Express application
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/MyApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create the User model
const User = mongoose.model('User', userSchema);



const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(googleClientId);

// User registration route
app.post('/Signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login route
app.post('/Login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function verifyGoogleToken(token) {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: googleClientId,
  });
  const payload = ticket.getPayload();
  return payload;
}

app.post('/googleSignUp', async (req, res) => {
  const { googleToken } = req.body;

  try {
    // Verify the Google token
    const payload = await verifyGoogleToken(googleToken);
    const userId = payload['sub'];
    const email = payload['email'];

    // Check if the user already exists in the database
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({
      username: email,
      email,
      password: '',
    });
    user = await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error signing up with Google:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/googleLogin', async (req, res) => {
  const { googleToken } = req.body;

  try {
    // Verify the Google token
    const payload = await verifyGoogleToken(googleToken);
    const userId = payload['sub'];
    const email = payload['email'];

    // Check if the user exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if not exists
      const newUser = new User({
        username: email,
        email,
        password: '',
      });
      user = await newUser.save();
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in with Google:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Protected route that requires authentication
app.get('/protected', authenticateToken, (req, res) => {
  // Access the authenticated user's information from req.user
  res.json({ message: 'Protected route accessed successfully', user: req.user });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = { userId: decoded.userId };
    next();
  });
}

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});