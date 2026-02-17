
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChefHat, ArrowRight, Plus, Database, ShieldCheck, RefreshCw, Cloud, CloudOff, User as UserIcon, Lock, AlertTriangle, UploadCloud, Zap, Carrot, Droplets, Minus } from 'lucide-react';
import { createClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import RecipesTab from './components/RecipesTab';
import Navigation from './components/Navigation';
import RecipeForm from './components/RecipeForm';
import MealPlanTab from './components/MealPlanTab';
import GroceriesTab from './components/GroceriesTab';

// Types & Interfaces
export type TimeSlot = 'Pre-Breakfast' | 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner' | 'Post-Dinner';
export interface Ingredient { item: string; quantity: number; unit: string; storeName?: string; }
export interface PrepTask { task: string; duration: string; }
export interface Recipe {
  id: string;
  name: string;
  type?: 'Regular' | 'EatOut';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  prepTasks: PrepTask[];
  macros: { calories: number; protein: number; carbs: number; fat: number; fiber: number; };
  synced?: boolean;
}
export type UserProfile = 'V' | 'M';
export interface PlannedMeal { recipeId: string; profile: UserProfile; }
export interface MealPlan { [date: string]: { [slot: string]: PlannedMeal[]; }; }
export interface WaterIntake { [date: string]: { [profile in UserProfile]: number }; }

const DB_NAME = 'MealPrepVM_Vault';
const STORE_NAME = 'AppData';
const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

// --- INDEXEDDB HELPER ---
const dbPromise = (async () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 11);
    request.onupgradeneeded = (e: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null as any);
  });
})();

const saveDataLocal = async (key: string, val: any) => {
  const db = await dbPromise;
  if (!db) return;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(val, key);
  return new Promise((res) => (tx.oncomplete = res));
};

const getDataLocal = async (key: string) => {
  const db = await dbPromise;
  if (!db) return null;
  return new Promise((resolve) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'recipes' | 'mealplan' | 'groceries'>('home');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'local-only' | 'locked'>('locked');
  const [isLoading, setIsLoading] = useState(true);
  
  const [sbConfig, setSbConfig] = useState<{ url: string; key: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const scrollContainerRef = useRef<HTMLElement>(null);

  const supabase = useMemo(() => {
    if (!sbConfig?.url || !sbConfig?.key) return null;
    try {
      return createClient(sbConfig.url, sbConfig.key);
    } catch (e) {
      return null;
    }
  }, [sbConfig]);

  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayDisplay = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), []);

  // Scroll to top when tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const homeTotals = useMemo(() => {
    const v = { protein: 0, fiber: 0 };
    const m = { protein: 0, fiber: 0 };
    const dayPlan = mealPlan[todayKey] || {};
    // Fix: Explicitly cast Object.values result for iteration on indexed object to avoid 'unknown' errors
    (Object.values(dayPlan) as PlannedMeal[][]).forEach(meals => {
      meals.forEach(meal => {
        const recipe = recipes.find(r => r.id === meal.recipeId);
        if (recipe) {
          const target = meal.profile === 'V' ? v : m;
          target.protein += recipe.macros.protein || 0;
          target.fiber += recipe.macros.fiber || 0;
        }
      });
    });
    return { V: v, M: m };
  }, [mealPlan, recipes, todayKey]);

  const fetchAndMergeCloudData = useCallback(async () => {
    if (!supabase) return;
    setSyncStatus('syncing');
    try {
      const [{ data: cloudRecipes }, { data: cloudPlans }, { data: cloudWater }] = await Promise.all([
        supabase.from('recipes').select('*'),
        supabase.from('meal_plans').select('*'),
        supabase.from('water_intake').select('*')
      ]);

      setRecipes(prevLocal => {
        const recipeMap = new Map<string, Recipe>();
        prevLocal.forEach(r => recipeMap.set(r.id, { ...r, synced: false }));
        // Fix: Cast cloudRecipes to any[] to avoid 'unknown' iteration issues
        (cloudRecipes as any[])?.forEach((r: any) => {
          recipeMap.set(r.id, {
            id: r.id,
            name: r.name,
            type: r.type || 'Regular',
            difficulty: r.difficulty,
            ingredients: r.ingredients,
            prepTasks: r.prep_tasks || [], // FIXED: renamed from prep_tasks to prepTasks to satisfy TS2561
            macros: r.macros,
            synced: true
          });
        });
        const final = Array.from(recipeMap.values());
        saveDataLocal('recipes', final);
        return final;
      });

      if (cloudPlans) {
        setMealPlan(prev => {
          const newPlan = { ...prev };
          // Fix: Cast cloudPlans to any[]
          (cloudPlans as any[]).forEach((p: any) => {
            const dateStr = p.planned_date;
            if (!newPlan[dateStr]) newPlan[dateStr] = {};
            newPlan[dateStr][p.slot] = p.meals;
          });
          saveDataLocal('mealplan', newPlan);
          return newPlan;
        });
      }

      if (cloudWater) {
        setWaterIntake(prev => {
          const newWater = { ...prev };
          // Fix: Cast cloudWater to any[]
          (cloudWater as any[]).forEach((w: any) => {
            const dateStr = w.planned_date;
            if (!newWater[dateStr]) newWater[dateStr] = { V: 0, M: 0 };
            newWater[dateStr][w.profile as UserProfile] = w.amount;
          });
          saveDataLocal('water_intake', newWater);
          return newWater;
        });
      }
      setSyncStatus('synced');
    } catch (err) {
      setSyncStatus('error');
    }
  }, [supabase]);

  const handleUpdateWater = async (date: string, profile: UserProfile, delta: number) => {
    setWaterIntake(prev => {
      const dayWater = prev[date] || { V: 0, M: 0 };
      const newAmount = Math.max(0, dayWater[profile] + delta);
      const next = { ...prev, [date]: { ...dayWater, [profile]: newAmount } };
      saveDataLocal('water_intake', next);
      return next;
    });

    if (supabase) {
      try {
        const dayWater = waterIntake[date] || { V: 0, M: 0 };
        const amount = Math.max(0, dayWater[profile] + delta);
        await supabase.from('water_intake').upsert({
          user_id: user?.id || PUBLIC_USER_ID,
          planned_date: date,
          profile,
          amount
        }, { onConflict: 'user_id,planned_date,profile' });
      } catch (err) {
        setSyncStatus('error');
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      const savedConfig = await getDataLocal('supabase_config') as any;
      if (savedConfig?.url) {
        setSbConfig(savedConfig);
        setSyncStatus('local-only');
      }
      const [r, p, w] = await Promise.all([
        getDataLocal('recipes'),
        getDataLocal('mealplan'),
        getDataLocal('water_intake')
      ]);
      if (r) setRecipes(r as any);
      if (p) setMealPlan(p as any);
      if (w) setWaterIntake(w as any);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      fetchAndMergeCloudData();
    });
    return () => subscription.unsubscribe();
  }, [supabase, fetchAndMergeCloudData]);

  const handleSaveRecipe = async (recipe: Recipe) => {
    setRecipes(prev => {
      const next = prev.some(r => r.id === recipe.id) ? prev.map(r => r.id === recipe.id ? recipe : r) : [...prev, recipe];
      saveDataLocal('recipes', next);
      return next;
    });
    setIsFormOpen(false);
    if (supabase) {
      try {
        await supabase.from('recipes').upsert({
          id: recipe.id,
          name: recipe.name,
          type: recipe.type || 'Regular',
          difficulty: recipe.difficulty,
          ingredients: recipe.ingredients,
          prep_tasks: recipe.prepTasks,
          macros: recipe.macros,
          user_id: user?.id || PUBLIC_USER_ID
        });
        setSyncStatus('synced');
      } catch (e) {
        setSyncStatus('error');
      }
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm("Delete recipe?")) return;
    setRecipes(prev => {
      const next = prev.filter(r => r.id !== id);
      saveDataLocal('recipes', next);
      return next;
    });
    if (supabase) {
      await supabase.from('recipes').delete().eq('id', id);
    }
  };

  const handleUpdatePlan = async (date: string, slot: string, meals: PlannedMeal[]) => {
    setMealPlan(prev => {
      const next = { ...prev, [date]: { ...(prev[date] || {}), [slot]: meals } };
      saveDataLocal('mealplan', next);
      return next;
    });
    if (supabase) {
      await supabase.from('meal_plans').upsert({
        user_id: user?.id || PUBLIC_USER_ID,
        planned_date: date,
        slot,
        meals
      }, { onConflict: 'user_id,planned_date,slot' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[100dvh] bg-green-50"><RefreshCw className="w-8 h-8 text-green-600 animate-spin" /></div>;

  if (!sbConfig) {
    return (
      <div className="min-h-[100dvh] bg-green-950 flex flex-col items-center justify-center p-6 ios-safe-top ios-safe-bottom">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const config = { url: fd.get('url') as string, key: fd.get('key') as string };
          await saveDataLocal('supabase_config', config);
          setSbConfig(config);
        }} className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] w-full max-w-sm space-y-8 backdrop-blur-md">
          <div className="flex flex-col items-center space-y-4">
             {/* Same MV Logo used on Home */}
             <div className="relative w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-white/10 overflow-hidden active:scale-95 transition-transform">
                <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-indigo-50" />
                <div className="flex items-baseline gap-0 relative">
                  <span className="text-2xl font-black text-green-600 tracking-tighter">M</span>
                  <span className="text-xl font-black text-indigo-600 tracking-tighter -ml-0.5">V</span>
                </div>
             </div>
             <div className="text-center">
                <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-green-400 to-indigo-400 bg-clip-text text-transparent">MuVe</h1>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Personal Nature Vault</p>
             </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Project URL</label>
              <input name="url" required placeholder="https://xyz.supabase.co" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-white/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Anon Key</label>
              <input name="key" type="password" required placeholder="eyJhbG..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/20" />
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all">
            Open Vault
          </button>
        </form>
        <p className="mt-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">End-to-End Encrypted Access</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-2xl mx-auto bg-white shadow-2xl relative overflow-hidden ios-safe-top">
      {/* Top Floating Status */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-end px-6 pt-4 max-w-2xl mx-auto pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur shadow-sm border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
          {syncStatus === 'syncing' ? <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" /> : 
           syncStatus === 'synced' ? <Cloud className="w-3 h-3 text-green-600" /> : <CloudOff className="w-3 h-3 text-gray-400" />}
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{syncStatus}</span>
        </div>
      </div>

      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-momentum pb-32">
        <div className="p-6 page-transition">
          {activeTab === 'home' && (
            <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
              
              {/* Stylized Logo Header */}
              <div className="flex items-center gap-3.5 mt-2">
                 <div className="relative w-11 h-11 bg-white rounded-2xl shadow-md flex items-center justify-center border border-gray-50 overflow-hidden active:scale-95 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-indigo-50" />
                    <div className="flex items-baseline gap-0 relative">
                      <span className="text-xl font-black text-green-600 tracking-tighter">M</span>
                      <span className="text-lg font-black text-indigo-600 tracking-tighter -ml-0.5">V</span>
                    </div>
                 </div>
                 <div className="leading-none">
                    <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-green-600 to-indigo-600 bg-clip-text text-transparent">MuVe</h1>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">{todayDisplay}</p>
                 </div>
              </div>

              {/* Water Intake Station - High Visibility */}
              <section className="bg-blue-50/70 border border-blue-100 rounded-[2.5rem] p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest">Hydration</h2>
                  </div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Goal 2.5L</span>
                </div>

                <div className="space-y-6">
                  <HomeWaterItem profile="V" amount={waterIntake[todayKey]?.V || 0} onUpdate={(d) => handleUpdateWater(todayKey, 'V', d)} color="indigo" />
                  <HomeWaterItem profile="M" amount={waterIntake[todayKey]?.M || 0} onUpdate={(d) => handleUpdateWater(todayKey, 'M', d)} color="emerald" />
                </div>
              </section>

              {/* Dominant Macros Summary */}
              <div className="grid grid-cols-2 gap-4">
                <HomeMacroCard profile="V" protein={homeTotals.V.protein} fiber={homeTotals.V.fiber} targets={{ protein: 75, fiber: 25 }} color="indigo" />
                <HomeMacroCard profile="M" protein={homeTotals.M.protein} fiber={homeTotals.M.fiber} targets={{ protein: 100, fiber: 34 }} color="emerald" />
              </div>
            </div>
          )}

          {activeTab === 'recipes' && (
            <div className="pt-2">
              <header className="mb-6 flex justify-between items-end">
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Catalog</h2>
                <button onClick={() => { setEditingRecipe(null); setIsFormOpen(true); }} className="p-3 bg-green-600 text-white rounded-2xl shadow-lg active:scale-95 transition-transform"><Plus className="w-6 h-6" /></button>
              </header>
              <RecipesTab recipes={recipes} onEdit={(r) => { setEditingRecipe(r); setIsFormOpen(true); }} onDelete={handleDeleteRecipe} />
            </div>
          )}

          {activeTab === 'mealplan' && <div className="pt-2"><MealPlanTab recipes={recipes} mealPlan={mealPlan} onUpdatePlan={handleUpdatePlan} waterIntake={waterIntake} onUpdateWater={handleUpdateWater} /></div>}
          {activeTab === 'groceries' && <div className="pt-2"><GroceriesTab recipes={recipes} mealPlan={mealPlan} /></div>}
        </div>
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {isFormOpen && <RecipeForm onClose={() => setIsFormOpen(false)} onSave={handleSaveRecipe} initialData={editingRecipe} />}
    </div>
  );
};

const HomeWaterItem: React.FC<{ profile: UserProfile; amount: number; onUpdate: (delta: number) => void; color: 'indigo' | 'emerald' }> = ({ profile, amount, onUpdate }) => {
  const isV = profile === 'V';
  const progress = Math.min(100, (amount / 2500) * 100);
  const accentColor = isV ? 'bg-indigo-600' : 'bg-emerald-600';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${accentColor}`}>{profile}</div>
          <div className="leading-none">
            <span className="text-lg font-black text-blue-900">{amount}</span>
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter ml-0.5">ml</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={() => onUpdate(-50)} 
            className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 border-2 border-rose-100 rounded-xl active:scale-90 transition-transform shadow-sm"
          >
            <Minus className="w-5 h-5 stroke-[4px]" />
          </button>
          <button onClick={() => onUpdate(50)} className="px-4 h-10 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase active:scale-95 transition-transform shadow-sm">+50</button>
          <button onClick={() => onUpdate(100)} className="px-4 h-10 bg-blue-900 text-white rounded-xl font-black text-[10px] uppercase active:scale-95 transition-transform shadow-sm">+100</button>
        </div>
      </div>
      <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden relative">
        <div className={`h-full bg-blue-500 transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
};

const HomeMacroCard: React.FC<{ profile: UserProfile; protein: number; fiber: number; targets: { protein: number; fiber: number }; color: 'indigo' | 'emerald' }> = ({ profile, protein, fiber, targets, color }) => {
  const isV = profile === 'V';
  const bgColor = isV ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100';
  const accentColor = isV ? 'bg-indigo-600' : 'bg-emerald-600';
  const textColor = isV ? 'text-indigo-900' : 'text-emerald-900';

  return (
    <div className={`p-5 rounded-[2rem] border ${bgColor} shadow-sm space-y-4`}>
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black text-white ${accentColor}`}>{profile}</div>
        <span className={`text-[8px] font-black uppercase tracking-widest opacity-40 ${textColor}`}>Target Score</span>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className={`text-[8px] font-black uppercase tracking-widest opacity-50 ${textColor}`}>Protein</span>
          <span className={`text-base font-black ${textColor}`}>{protein}<span className="text-[9px] opacity-30 ml-0.5">g</span></span>
        </div>
        <div className="flex justify-between items-end">
          <span className={`text-[8px] font-black uppercase tracking-widest opacity-50 ${textColor}`}>Fiber</span>
          <span className={`text-base font-black ${textColor}`}>{fiber}<span className="text-[9px] opacity-30 ml-0.5">g</span></span>
        </div>
      </div>
      <div className="h-1 bg-white/50 rounded-full overflow-hidden">
        <div className={`h-full ${accentColor} transition-all duration-1000`} style={{ width: `${Math.min(100, (protein / targets.protein) * 100)}%` }} />
      </div>
    </div>
  );
};

export default App;
