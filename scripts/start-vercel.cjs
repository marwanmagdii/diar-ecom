const { spawn } = require('child_process');

const child = spawn('npx vercel dev', [], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => process.exit(code || 0));
