const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const { authenticateJWT } = require('./middleware/auth');
const Checklist = require('./models/Checklist');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Set up multer to handle file uploads in memory (we discard the file payload)
const upload = multer({ storage: multer.memoryStorage() });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for Document Service'))
  .catch(err => console.error('MongoDB connection error:', err));

// GET /status: Retrieves the user's document upload checklist status from MongoDB.
app.get('/status', authenticateJWT, async (req, res) => {
  try {
    let checklist = await Checklist.findOne({ userId: req.user.id });
    
    if (!checklist) {
      checklist = await Checklist.create({ userId: req.user.id });
    }
    
    res.json(checklist);
  } catch (error) {
    console.error('Error fetching checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /upload: Simulates document upload by updating the checklist flags in MongoDB.
app.post('/upload', authenticateJWT, upload.single('document'), async (req, res) => {
  try {
    const { documentType } = req.body;
    
    // The file is in req.file, but we intentionally discard it for the MVP!
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const validTypes = ['idCard', 'proofOfIncome', 'proofOfAddress', 'guarantorId', 'guarantorIncome'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    let checklist = await Checklist.findOne({ userId: req.user.id });
    if (!checklist) {
      checklist = new Checklist({ userId: req.user.id });
    }

    if (documentType === 'guarantorIncome' || documentType === 'proofOfIncome') {
      if (checklist[documentType] && checklist[documentType].length >= 5) {
        return res.status(400).json({ error: `Maximum of 5 documents reached for ${documentType}.` });
      }
      // Generate a unique dummy filename
      const fileName = req.file.originalname + '_' + Math.random().toString(36).substring(7);
      if (!checklist[documentType]) checklist[documentType] = [];
      checklist[documentType].push(fileName);
    } else {
      checklist[documentType] = true;
    }

    await checklist.save();
    res.json({ message: 'Dummy document uploaded successfully', checklist });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /documents/:documentType: Simulates document removal by setting the corresponding checklist flag to false or removing an array item.
app.delete('/documents/:documentType', authenticateJWT, async (req, res) => {
  try {
    const { documentType } = req.params;
    const { fileId } = req.query;
    
    const validTypes = ['idCard', 'proofOfIncome', 'proofOfAddress', 'guarantorId', 'guarantorIncome'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    let checklist = await Checklist.findOne({ userId: req.user.id });
    if (!checklist) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    if (documentType === 'guarantorIncome' || documentType === 'proofOfIncome') {
      if (fileId && checklist[documentType]) {
        checklist[documentType] = checklist[documentType].filter(f => f !== fileId);
      }
    } else {
      checklist[documentType] = false;
    }

    await checklist.save();
    res.json({ message: 'Document removed successfully', checklist });
  } catch (error) {
    console.error('Error removing document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.DOCUMENT_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Document Service running on port ${PORT}`);
});
