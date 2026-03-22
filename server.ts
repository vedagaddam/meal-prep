import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = 3000;

const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

app.use(cors());
app.use(bodyParser.json());

// Initialize Supabase for server-side stats
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// API routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Secure Stats API for Widget
app.get('/api/stats', async (req: Request, res: Response) => {
  const widgetKey = req.query.key || req.headers['x-widget-key'];
  const secretKey = process.env.WIDGET_SECRET_KEY;

  if (!secretKey || widgetKey !== secretKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured on server' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const userId = (req.query.uid as string) || PUBLIC_USER_ID;

    // Fetch all needed data in parallel
    const [
      { data: waterData },
      { data: mealPlans },
      { data: recipes }
    ] = await Promise.all([
      supabase.from('water_intake').select('*').eq('user_id', userId).eq('planned_date', today),
      supabase.from('meal_plans').select('*').eq('user_id', userId).eq('planned_date', today),
      supabase.from('recipes').select('*')
    ]);

    // Calculate totals
    const stats = {
      date: today,
      v: { water: 0, protein: 0, fiber: 0 },
      m: { water: 0, protein: 0, fiber: 0 }
    };

    // Water
    waterData?.forEach((w: any) => {
      if (w.profile === 'V') stats.v.water = w.amount;
      if (w.profile === 'M') stats.m.water = w.amount;
    });

    // Macros from Meal Plan
    const recipeMap = new Map();
    recipes?.forEach(r => recipeMap.set(r.id, r));

    mealPlans?.forEach((p: any) => {
      const meals = p.meals || [];
      meals.forEach((meal: any) => {
        const recipe = recipeMap.get(meal.recipeId);
        if (recipe) {
          const target = meal.profile === 'V' ? stats.v : stats.m;
          target.protein += recipe.macros?.protein || 0;
          target.fiber += recipe.macros?.fiber || 0;
        }
      });
    });

    res.json(stats);
  } catch (error: any) {
    console.error('Stats API Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
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
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
