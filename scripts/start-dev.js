import { spawn } from 'child_process';
const api = spawn('node', ['server.js'], { stdio: 'inherit', shell: true });
const vite = spawn('npx', ['vite', '--port', '3000'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  api.kill();
  vite.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  api.kill();
  vite.kill();
  process.exit();
});
