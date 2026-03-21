import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import webpush from 'web-push';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// VAPID keys should be in environment variables
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || 'BHxQBYCzfC83A_xFfFdpXMNMsbxmA1hwJWe00MC6m8Z8k-MQfqWvCqt4khMoUsqmz-CT3Ia2_MY7bjT7IwouJs8';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YP0Qod0ld7Mbxueyuacp255l2sG2SIXoCQW3xhDnoDg';

webpush.setVapidDetails(
  'mailto:gaddamveda@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

app.use(cors());
app.use(bodyParser.json());

// API routes
app.post('/api/push/send', async (req, res) => {
  const { subscription, title, body } = req.body;
  
  if (!subscription) {
    return res.status(400).json({ error: 'Subscription is required' });
  }

  const payload = JSON.stringify({ title, body });

  try {
    await webpush.sendNotification(subscription, payload);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
