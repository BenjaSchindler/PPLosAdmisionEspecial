const express = require('express');
const router = express.Router();
const multer = require('multer');
const File = require('./fileModel');
const fs = require('fs'); 



// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });


// Route for file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, path } = req.file;
    const userId = req.body.userId; // Access the userId from the request body
    
    const newFile = new File({
      filename: originalname,
      path: path,
      uploadedBy: userId,
    });
    
    await newFile.save();
    res.status(201).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for retrieving files based on user ID
router.get('/files/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const files = await File.find({ uploadedBy: userId });
    res.status(200).json(files);
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for retrieving files based on group ID
router.get('/files/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const files = await File.find({ groupId: groupId });
    res.status(200).json(files);
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for deleting a file
router.delete('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the file by ID
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file from the database
    await File.findByIdAndDelete(id);

    // Delete the file from the file system
    const filePath = file.path;
    fs.unlinkSync(filePath);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;