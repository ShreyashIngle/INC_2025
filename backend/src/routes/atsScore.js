import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define consistent paths for resources
const ATS_SCORE_DIR = path.join(__dirname, '../../src/features/ats_score');
const UPLOADS_DIR = path.join(ATS_SCORE_DIR, 'uploads');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (_, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (_, file, cb) {
    // Use timestamp to ensure unique filenames
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Route to analyze resume
router.post('/analyze', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Use proper FormData for Node.js
    const formData = new FormData();
    
    // Append the file from disk
    formData.append('resume', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: 'application/pdf'
    });
    
    // Add other form fields
    formData.append('job_description', req.body.job_description || '');
    formData.append('analysis_option', req.body.analysis_option || 'Quick Scan');

    try {
      // Make request to Flask backend (not FastAPI)
      const response = await axios.post('http://localhost:5000/analyze', formData, {
        headers: {
          ...formData.getHeaders()
        },
      });

      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.json({ 
        success: true,
        analysis: response.data.response || response.data
      });
    } catch (error) {
      console.error('Error communicating with backend service:', error);
      
      // Clean up the uploaded file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({ 
        error: 'Failed to analyze resume', 
        details: error.message 
      });
    }
  } catch (error) {
    console.error('Resume analysis error:', error);
    
    // Clean up the uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;