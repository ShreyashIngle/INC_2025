import express from 'express';
import { spawn } from 'child_process';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile/:username', authenticate, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Spawn Python process
    const pythonProcess = spawn('python3', ['src/utils/leetcode_scraper.py', username]);
    
    let dataString = '';
    
    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    // Handle errors
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });
    
    // Process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Failed to fetch LeetCode data' });
      }
      try {
        const profileData = JSON.parse(dataString);
        res.json(profileData);
      } catch (error) {
        res.status(500).json({ error: 'Failed to parse LeetCode data' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;