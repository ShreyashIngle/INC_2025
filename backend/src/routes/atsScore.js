import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';
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

// Create form data helper for axios
const createFormData = (file, jobDescription, analysisOption) => {
  const formData = new FormData();
  formData.append('resume', fs.createReadStream(file.path), {
    filename: file.originalname,
    contentType: 'application/pdf'
  });
  formData.append('job_description', jobDescription || '');
  formData.append('analysis_option', analysisOption || 'Quick Scan');
  return formData;
};

// Route to analyze resume
router.post('/score', authenticate, upload.single('resume'), async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Prepare form data
    const formData = createFormData(
      req.file, 
      req.body.job_description, 
      req.body.analysis_option
    );

    try {
      // Make request to FastAPI backend
      const response = await axios.post('http://localhost:8000/score', formData, {
        headers: {
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.json({ 
        success: true,
        analysis: response.data.response || response.data
      });
    } catch (backendError) {
      console.error('Backend communication error:', backendError);
      
      // Clean up file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({ 
        error: 'Failed to analyze resume', 
        details: backendError.response?.data || backendError.message 
      });
    }
  } catch (error) {
    console.error('Resume analysis error:', error);
    
    // Ensure file is cleaned up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Additional route for getting analysis options
router.get('/analysis-options', authenticate, (req, res) => {
  res.json({
    options: [
      'Quick Scan',
      'Detailed Analysis', 
      'ATS Optimization'
    ]
  });
});

export default router;