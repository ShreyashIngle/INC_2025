import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define consistent paths for resources
const RESUME_ANALYZER_DIR = path.join(__dirname, '../../src/features/resume_analyzer');
const UPLOADS_DIR = path.join(RESUME_ANALYZER_DIR, 'uploads');
const COMPANY_DATA_PATH = path.join(RESUME_ANALYZER_DIR, 'company_data.csv');

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

// Helper function to parse CSV and get company names
function parseCompanies() {
  try {
    if (!fs.existsSync(COMPANY_DATA_PATH)) {
      console.error(`CSV file not found: ${COMPANY_DATA_PATH}`);
      return { error: 'Company data file not found' };
    }
    
    const csv = fs.readFileSync(COMPANY_DATA_PATH, 'utf8');
    const lines = csv.split('\n');
    
    if (lines.length === 0) {
      return { error: 'Empty CSV file' };
    }
    
    const headers = lines[0].split(',');
    const companyNameIndex = headers.indexOf('Company Name');
    
    if (companyNameIndex === -1) {
      return { error: 'Invalid CSV format - Company Name column not found' };
    }
    
    const companies = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const columns = lines[i].split(',');
        if (columns.length > companyNameIndex && columns[companyNameIndex].trim()) {
          companies.push(columns[companyNameIndex].trim());
        }
      }
    }
    
    // Remove duplicates
    return { companies: [...new Set(companies)] };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return { error: 'Failed to parse company data' };
  }
}

// Route to process resume
router.post('/analyze', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Prepare form data for backend
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: 'application/pdf'
    });

    // Add optional fields
    const optionalFields = [
      'company', 'cgpa', 'hsc', 'ssc', 'branch'
    ];

    optionalFields.forEach(field => {
      if (req.body[field]) {
        formData.append(field, req.body[field]);
      }
    });

    try {
      // Make request to FastAPI backend
      const response = await axios.post('http://localhost:8000/analyze', formData, {
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
        analysis: response.data
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
    console.error('Resume processing error:', error);
    
    // Ensure file is cleaned up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Route to get company names
router.get('/companies', authenticate, (req, res) => {
  try {
    const result = parseCompanies();
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json({ companies: result.companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies', message: error.message });
  }
});

export default router;