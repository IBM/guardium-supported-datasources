/**
 * start-app.js
 * Script to start both the React frontend and the AskMeAny API server
 */

const { spawn } = require('child_process');
const path = require('path');

// Start the API server
console.log('Starting AskMeAny API server...');
const apiServer = spawn('node', [path.join(__dirname, 'src/server/askMeAnyServer.js')], {
  stdio: 'inherit'
});

// Start the React frontend
console.log('Starting React frontend...');
const reactApp = spawn('npm', ['start'], {
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  apiServer.kill();
  reactApp.kill();
  process.exit();
});

// Handle API server exit
apiServer.on('close', (code) => {
  console.log(`API server exited with code ${code}`);
  if (code !== 0) {
    console.error('API server crashed. Shutting down...');
    reactApp.kill();
    process.exit(1);
  }
});

// Handle React app exit
reactApp.on('close', (code) => {
  console.log(`React app exited with code ${code}`);
  if (code !== 0) {
    console.error('React app crashed. Shutting down...');
    apiServer.kill();
    process.exit(1);
  }
});

console.log('Both services started. Press Ctrl+C to stop.');

// Made with Bob
