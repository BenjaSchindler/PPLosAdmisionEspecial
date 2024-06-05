const express = require('express');
const multer = require('multer');
const router = express.Router();
const File = require('./fileModel');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const newFile = new File({
      filename: req.file.filename,
      path: req.file.path,
      uploadedBy: userId
    });
    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch files by user ID
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const files = await File.find({ uploadedBy: userId });
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
