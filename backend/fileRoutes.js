const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const File = require('./fileModel');
const { authenticateToken } = require('./authMiddleware');
require('dotenv').config();

const router = express.Router();

// Google Cloud Storage setup
const storage = new Storage();
const bucketName = 'blitzwebapp';

// Multer setup
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

const uploadToGCS = async (fileBuffer, fileName) => {
  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream();

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => reject(err));
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });
    blobStream.end(fileBuffer);
  });
};

const deleteFromGCS = async (fileName) => {
  try {
    await storage.bucket(bucketName).file(fileName).delete();
    console.log(`Successfully deleted file from GCS: ${fileName}`);
  } catch (error) {
    console.error(`Failed to delete file from GCS: ${fileName}`, error);
  }
};

// Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
  const { userId, groupId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const fileName = Date.now() + '-' + req.file.originalname;
    const publicUrl = await uploadToGCS(req.file.buffer, fileName);

    const newFile = new File({
      filename: fileName,
      path: publicUrl,
      uploadedBy: userId,
      groupId: groupId || null
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// For deleting a user's file
router.delete('/:fileId', authenticateToken, async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await File.findById(fileId);
    if (file) {
      await deleteFromGCS(file.filename);
      await File.findByIdAndDelete(fileId);
      res.status(200).json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error(`Failed to delete file with ID: ${fileId}`, error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// For deleting a group file (with group admin authorization)
router.delete('/group/:groupId/:fileId', authenticateToken, async (req, res) => {
  const { groupId, fileId } = req.params;
  const userId = req.user.userId;

  try {
    const group = await Group.findById(groupId);
    if (group.administrators.includes(userId)) {
      const file = await File.findById(fileId);
      if (file) {
        await deleteFromGCS(file.filename);
        await File.findByIdAndDelete(fileId);
        res.status(200).json({ message: 'File deleted successfully' });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } else {
      res.status(403).json({ error: 'Unauthorized to delete this file' });
    }
  } catch (error) {
    console.error(`Failed to delete file with ID: ${fileId}`, error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Fetch files by user ID
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const files = await File.find({ uploadedBy: userId, groupId: null });
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch files by group ID
router.get('/group/:groupId', async (req, res) => {
  const { groupId } = req.params;

  try {
    const files = await File.find({ groupId });
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching group files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
