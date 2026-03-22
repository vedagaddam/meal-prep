import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Supabase for server-side stats
const getSupabase = () => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('[Supabase] Missing keys in environment.');
    return null;
  }
  return createClient(url, key);
};

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    supabaseConfigured: !!(process.env.VITE_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY)),
    widgetKeyConfigured: !!process.env.WIDGET_SECRET_KEY,
    env: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL
  });
});

// Secure Stats API for Widget
app.get('/api/stats', async (req, res) => {
  const widgetKey = req.query.key || req.headers['x-widget-key'];
  const secretKey = process.env.WIDGET_SECRET_KEY;

  if (!secretKey) {
    console.error('[Stats API] CRITICAL: WIDGET_SECRET_KEY is not set.');
    return res.status(500).json({ error: 'Server: WIDGET_SECRET_KEY missing' });
  }

  if (widgetKey !== secretKey) {
    console.warn(`[Stats API] Unauthorized access attempt. Key provided: ${widgetKey ? 'YES' : 'NO'}`);
    return res.status(401).json({ error: 'Unauthorized: Key mismatch' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ error: 'Server: Supabase keys missing' });
  }

  console.log(`[Stats API] Request from UID: ${req.query.uid || 'PUBLIC'}, Date: ${req.query.date || 'TODAY'}`);

  try {
    const rawUid = req.query.uid as string;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const userId = (rawUid && uuidRegex.test(rawUid)) ? rawUid : PUBLIC_USER_ID;
    
    const dateQuery = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const [waterRes, mealRes, recipeRes] = await Promise.all([
      supabase.from('water_intake')
        .select('*')
        .eq('planned_date', dateQuery)
        .or(`user_id.eq.${userId},user_id.is.null`),
      supabase.from('meal_plans')
        .select('*')
        .eq('planned_date', dateQuery)
        .or(`user_id.eq.${userId},user_id.is.null`),
      supabase.from('recipes').select('*')
    ]);

    if (waterRes.error) console.error('[Stats API] Water Error:', waterRes.error);
    if (mealRes.error) console.error('[Stats API] Meal Error:', mealRes.error);
    if (recipeRes.error) console.error('[Stats API] Recipe Error:', recipeRes.error);

    const waterData = waterRes.data || [];
    const mealPlans = mealRes.data || [];
    const recipes = recipeRes.data || [];

    const stats = {
      date: dateQuery,
      v: { water: 0, protein: 0, fiber: 0 },
      m: { water: 0, protein: 0, fiber: 0 }
    };

    waterData?.forEach((w: any) => {
      const profile = (w.profile || '').toUpperCase();
      if (profile === 'V') stats.v.water = w.amount;
      if (profile === 'M') stats.m.water = w.amount;
    });

    const recipeMap = new Map();
    recipes?.forEach(r => recipeMap.set(r.id, r));

    mealPlans?.forEach((p: any) => {
      const meals = p.meals || [];
      meals.forEach((meal: any) => {
        const recipe = recipeMap.get(meal.recipeId);
        if (recipe) {
          const profile = (meal.profile || '').toUpperCase();
          const target = profile === 'V' ? stats.v : stats.m;
          target.protein += recipe.macros?.protein || 0;
          target.fiber += recipe.macros?.fiber || 0;
        }
      });
    });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json(stats);
  } catch (error: any) {
    console.error('Stats API Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default app;
