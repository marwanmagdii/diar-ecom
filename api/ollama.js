import { exec, spawn } from 'child_process';

let ollamaProcess = null;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action } = req.body;
    
    if (action === 'start') {
      if (ollamaProcess) {
        return res.status(200).json({ message: 'Ollama is already running' });
      }
      
      // Attempt to start ollama serve
      // On Windows, ollama serve runs the daemon
      ollamaProcess = spawn('ollama', ['serve'], { shell: true });
      
      ollamaProcess.stdout.on('data', (data) => {
        console.log(`[Ollama]: ${data}`);
      });
      
      ollamaProcess.stderr.on('data', (data) => {
        console.error(`[Ollama Error]: ${data}`);
      });

      ollamaProcess.on('close', (code) => {
        console.log(`[Ollama] Process exited with code ${code}`);
        ollamaProcess = null;
      });

      return res.status(200).json({ message: 'Ollama server started' });
    } 
    
    if (action === 'stop') {
      if (ollamaProcess) {
        // Kill the spawned process
        ollamaProcess.kill('SIGTERM');
        ollamaProcess = null;
      }
      
      // Also forcefully kill any running ollama background processes on Windows just in case
      exec('taskkill /IM ollama.exe /F', (err) => {
        return res.status(200).json({ message: 'Ollama server stopped' });
      });
      return;
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
