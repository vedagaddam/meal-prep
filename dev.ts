import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './server';

const PORT = 3000;

async function startDevServer() {
  try {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // Use vite's connect instance as middleware
    app.use(vite.middlewares);
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Dev Server running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('Failed to start dev server:', e);
    process.exit(1);
  }
}

startDevServer();
