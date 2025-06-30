const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting DevOps Pipeline Dashboard...');

// Start backend server
const backend = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

// Wait a moment for backend to start
setTimeout(() => {
  // Start frontend dev server
  const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
    cwd: path.join(process.cwd(), 'client'),
    stdio: 'inherit'
  });

  frontend.on('error', (err) => {
    console.error('Frontend server error:', err);
  });
}, 2000);

backend.on('error', (err) => {
  console.error('Backend server error:', err);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  process.exit(0);
});

console.log('📊 Frontend will be available at: http://localhost:5173');
console.log('🔌 Backend API running on: http://localhost:3000');
console.log('📡 WebSocket endpoint: ws://localhost:3000/ws');