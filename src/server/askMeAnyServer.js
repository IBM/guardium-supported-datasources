/**
 * askMeAnyServer.js
 * A simple Express server to handle API calls to the AskMeAny Python backend
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002; // Changed from 3001 to 3002

// Middleware
app.use(express.json());
app.use(cors());

/**
 * API endpoint to process questions using the AskMeAny Python script
 */
app.post('/api/ask', (req, res) => {
  const { question } = req.body;
  
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Invalid question format' });
  }
  
  // Spawn Python process
  const pythonProcess = spawn('python3', [
    path.join(__dirname, '../chatbot/ChatbotBridge.py'),
    question
  ]);
  
  let stdout = '';
  let stderr = '';
  
  // Collect stdout data
  pythonProcess.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  
  // Collect stderr data
  pythonProcess.stderr.on('data', (data) => {
    stderr += data.toString();
    console.error(`Python script stderr: ${data}`);
  });
  
  // Handle process completion
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python process exited with code ${code}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({
        error: 'Python process failed',
        details: stderr
      });
    }
    
    try {
      // Extract only the JSON part from the output
      const jsonMatch = stdout.match(/({.*})/s);
      if (jsonMatch && jsonMatch[1]) {
        const jsonStr = jsonMatch[1];
        const result = JSON.parse(jsonStr);
        res.json(result);
      } else {
        // If no JSON found, return the raw output
        res.json({ response: stdout.trim() });
      }
    } catch (parseError) {
      console.error(`Error parsing Python response: ${parseError.message}`);
      console.error(`Raw response: ${stdout}`);
      res.status(500).json({
        error: 'Failed to parse Python response',
        details: parseError.message
      });
    }
  });
  
  // Handle process errors
  pythonProcess.on('error', (error) => {
    console.error(`Failed to start Python process: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to start Python process',
      details: error.message
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`AskMeAny server running on port ${PORT}`);
});

// Export for testing
module.exports = app;

// Made with Bob
