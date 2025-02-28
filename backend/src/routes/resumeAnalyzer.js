import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (_, file, cb) {
    const uploadDir = path.join(__dirname, '../../src/features/resume_analyzer/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (_, file, cb) {
    cb(null, file.originalname);
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

// Route to process resume
router.post('/process', authenticate, upload.single('cv'), async (req, res) => {
  try {
    // Forward the request to the Python API
    const { spawn } = await import('child_process');
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../src/features/Resume analyser/main.py'),
      '--company', req.body.company,
      '--cv', req.file.path,
      '--cgpa', req.body.cgpa,
      '--hsc', req.body.hsc,
      '--ssc', req.body.ssc,
      '--branch', req.body.branch
    ]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Failed to process resume' });
      }
      
      try {
        const parsedResult = JSON.parse(result);
        return res.json(parsedResult);
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse result', details: result });
      }
    });
  } catch (error) {
    console.error('Resume processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get company names
router.get('/companies', authenticate, (req, res) => {
  try {
    const companyDataPath = path.join(__dirname, '../../src/features/Resume analyser/company_data.csv');
    
    
    // Parse CSV to get company names
    const csv = fs.readFileSync(companyDataPath, 'utf8');
const lines = csv.split('\n');

    const headers = lines[0].split(',');
    const companyNameIndex = headers.indexOf('Company Name');
    
    if (companyNameIndex === -1) {
      return res.status(500).json({ error: 'Invalid CSV format' });
    }
    
    const companies = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const columns = lines[i].split(',');
        if (columns[companyNameIndex]) {
          companies.push(columns[companyNameIndex]);
        }
      }
    }
    
    // Remove duplicates
    const uniqueCompanies = [...new Set(companies)];
    res.json({ companies: uniqueCompanies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

export default router;