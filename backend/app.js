const express = require('express'); // Express for server
const cors = require('cors'); // CORS for cross-origin requests
const mongoose = require('mongoose'); // Mongoose for MongoDB
const bcrypt = require('bcrypt'); // Bcrypt for password hashing
const jwt = require('jsonwebtoken'); // JSON Web Tokens for authentication
const { OAuth2Client } = require('google-auth-library'); // Google OAuth client
const multer = require('multer'); // Multer for file upload handling
const path = require('path'); // Path module for file paths
require('dotenv').config(); // Load environment variables
const fileRoutes = require('./fileRoutes'); // Import file routes
const connectDB = require('./db'); // Connect to MongoDB
const File = require('./fileModel'); // File model
const groupRoutes = require('./groupRoutes'); // Group routes
const { spawn } = require('child_process'); // Child process for running Python script


const secretKey = process.env.SECRET_KEY;

// Create an instance of the Express application
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', 
}));
app.use(express.json());

// Define the User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: String,
  photoURL: String,
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Google OAuth client setup
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(googleClientId);


// User registration route
app.post('/Signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      photoURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/542px-Unknown_person.jpg',
    });

    // Save the user to the database
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: newUser._id }, secretKey);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id.toString(), // Include the user ID in the response
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
    // Find the user by username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
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

    res.status(200).json({
      token,
      user: {
        _id: user._id.toString(), // Include the user ID as a string in the response
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
    // Verify the Google token
    const payload = await verifyGoogleToken(googleToken);
    const userId = payload['sub'];
    const email = payload['email'];
    const photoURL = payload['picture'];
    const username = email.split('@')[0]; // Use the email prefix as the username

    // Check if the user exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if not exists
      const newUser = new User({
        username,
        email,
        password: '',
        photoURL,
      });
      user = await newUser.save();
    } else {
      // Update the user's photo URL and username if they have changed
      if (user.photoURL !== photoURL || user.username !== username) {
        user.photoURL = photoURL;
        user.username = username;
        await user.save();
      }
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, secretKey);

    // Send the user data along with the token
    res.status(200).json({
      token,
      user: {
        _id: user._id.toString(), // Include the user ID as a string in the response
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


// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File upload filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'), false);
  }
};

// Serve static files from the uploads directory
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Create the uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Add a new route to handle profile picture upload
app.post('/uploadProfilePhoto', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const photoURL = `http://localhost:8080/uploads/${req.file.filename}`;

    // Update the user's photo URL in the database
    const user = await User.findByIdAndUpdate(
      userId,
      { photoURL: photoURL },
      { new: true }
    );

    // Save the file metadata in the FileDB database
    const newFile = new File({
      filename: req.file.filename,
      path: req.file.path,
      uploadedBy: userId,
    });

    await newFile.save();

    // Send the updated user data back to the frontend
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

// Route for uploading files to a group
app.post('/uploadGroupFile', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const groupId = req.body.groupId;

    // Save the file metadata in the FileDB database
    const newFile = new File({
      filename: req.file.filename,
      path: req.file.path,
      uploadedBy: userId,
      groupId: groupId,
    });

    await newFile.save();

    res.status(201).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading group file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for asking questions via API
app.post('/api/ask', (req, res) => {
  const { question } = req.body;
  
  // Run your Python app with the question and get the answer
  const answer = runPythonApp(question);
  
  answer.then((result) => {
    res.json({ answer: result });
  }).catch((error) => {
    console.error('Error running Python app:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
});

// Function to run Python app asynchronously
function runPythonApp(question) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['../AppConsultas/agent.py', question]);
    
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(`Python process exited with code ${code}`);
      } else {
        resolve(output.trim());
      }
    });
  });
}

// Include file and group routes
app.use('/api', fileRoutes);
app.use('/api/groups', groupRoutes);

// Connect to MongoDB
connectDB();

// Export the app and User model for testing or external use
module.exports = { app, User };

// Start the server
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});