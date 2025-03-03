import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define consistent paths for resources
const RESUME_ANALYZER_DIR = path.join(__dirname, '../../src/features/resume_analyzer');
const UPLOADS_DIR = path.join(RESUME_ANALYZER_DIR, 'uploads');
const MAIN_PY_PATH = path.join(RESUME_ANALYZER_DIR, 'main.py');
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

// Helper function to parse CSV
function parseCSV(csvPath) {
  try {
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found: ${csvPath}`);
      return { error: 'Company data file not found' };
    }
    
    const csv = fs.readFileSync(csvPath, 'utf8');
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
    const uniqueCompanies = [...new Set(companies)];
    return { companies: uniqueCompanies };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return { error: 'Failed to parse company data' };
  }
}

// Route to process resume
router.post('/process', authenticate, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if main.py exists
    if (!fs.existsSync(MAIN_PY_PATH)) {
      console.error(`Python script not found: ${MAIN_PY_PATH}`);
      return res.status(500).json({ error: 'Resume processor not found' });
    }

    // Forward the request to the Python API
    const { spawn } = await import('child_process');
    const pythonProcess = spawn('python', [
      MAIN_PY_PATH,
      '--company', req.body.company || '',
      '--cv', req.file.path,
      '--cgpa', req.body.cgpa || '0',
      '--hsc', req.body.hsc || '0',
      '--ssc', req.body.ssc || '0',
      '--branch', req.body.branch || '',
      '--company_data', COMPANY_DATA_PATH
    ]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      // Remove temporary file
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing temporary file:', unlinkError);
      }

      if (code !== 0) {
        return res.status(500).json({ 
          error: 'Failed to process resume', 
          details: errorOutput || 'Python process exited with code ' + code 
        });
      }
      
      try {
        const parsedResult = JSON.parse(result);
        return res.json(parsedResult);
      } catch (e) {
        return res.status(500).json({ 
          error: 'Failed to parse result', 
          details: result || 'Empty result from Python process' 
        });
      }
    });
  } catch (error) {
    console.error('Resume processing error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Route to get company names
router.get('/companies', authenticate, (req, res) => {
  try {
    console.log(`Looking for company data at: ${COMPANY_DATA_PATH}`);
    
    // Check if file exists first
    if (!fs.existsSync(COMPANY_DATA_PATH)) {
      console.error(`Company data file not found: ${COMPANY_DATA_PATH}`);
      return res.status(404).json({ error: 'Company data file not found' });
    }
    
    const result = parseCSV(COMPANY_DATA_PATH);
    
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