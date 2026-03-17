const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting EduSure Server...');

const serverProcess = spawn('node', ['server.js'], {
    cwd: path.join(__dirname),
    stdio: 'inherit',
    shell: true
});

serverProcess.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
});

serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
});

serverProcess.on('close', (code) => {
    console.log(`Server process exited with code: ${code}`);
});

serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
});
