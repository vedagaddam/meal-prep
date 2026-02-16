import React, { useState, useEffect } from 'react';
import { ChefHat, ArrowRight, Plus } from 'lucide-react';
import RecipesTab from './components/RecipesTab';
import Navigation from './components/Navigation';
import RecipeForm from './components/RecipeForm';
import MealPlanTab from './components/MealPlanTab';

export interface Ingredient {
  item: string;
  quantity: number;
  unit: string;
}

export interface PrepTask {
  task: string;
  duration: string;
}

export interface Recipe {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  prepTasks: PrepTask[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type TimeSlot = 'Pre-Breakfast' | 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner' | 'Post-Dinner';

export interface MealPlan {
  [key: string]: {
    [key: string]: string[]; // Array of recipe IDs
  };
}

const DEFAULT_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Spinach Toor Dal',
    difficulty: 'Medium',
    ingredients: [
      { item: 'Toor Dal', quantity: 1, unit: 'cup' },
      { item: 'Fresh Spinach', quantity: 2, unit: 'cups' },
      { item: 'Onion', quantity: 1, unit: 'item' },
      { item: 'Tomato', quantity: 1, unit: 'item' },
      { item: 'Garlic cloves', quantity: 3, unit: 'items' },
      { item: 'Turmeric powder', quantity: 5, unit: 'grams' },
      { item: 'Ghee', quantity: 1, unit: 'tbsp' }
    ],
    prepTasks: [
      { task: 'Soak Toor Dal', duration: '30 mins' }
    ],
    macros: { calories: 320, protein: 18, carbs: 45, fat: 8 }
  },
  {
    id: '2',
    name: 'Dosa',
    difficulty: 'Hard',
    ingredients: [
      { item: 'Dosa Batter', quantity: 2, unit: 'cups' },
      { item: 'Oil', quantity: 2, unit: 'tbsp' },
      { item: 'Water', quantity: 0.5, unit: 'cup' },
      { item: 'Salt', quantity: 5, unit: 'grams' }
    ],
    prepTasks: [
      { task: 'Soak Rice & Dal', duration: '6 hours' },
      { task: 'Ferment Batter', duration: '8-12 hours' }
    ],
    macros: { calories: 120, protein: 3, carbs: 22, fat: 4 }
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'recipes' | 'mealplan' | 'settings'>('home');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const savedRecipes = localStorage.getItem('prep_vm_recipes_v3');
    if (savedRecipes) {
      try {
        setRecipes(JSON.parse(savedRecipes));
      } catch (e) {
        setRecipes(DEFAULT_RECIPES);
      }
    } else {
      setRecipes(DEFAULT_RECIPES);
    }

    const savedPlan = localStorage.getItem('prep_vm_mealplan_v1');
    if (savedPlan) {
      try {
        setMealPlan(JSON.parse(savedPlan));
      } catch (e) {
        setMealPlan({});
      }
    }
  }, []);

  useEffect(() => {
    if (recipes.length > 0) {
      localStorage.setItem('prep_vm_recipes_v3', JSON.stringify(recipes));
    }
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('prep_vm_mealplan_v1', JSON.stringify(mealPlan));
  }, [mealPlan]);

  const handleSaveRecipe = (recipe: Recipe) => {
    if (editingRecipe) {
      setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
    } else {
      setRecipes([...recipes, recipe]);
    }
    setIsFormOpen(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(recipes.filter(r => r.id !== id));
      // Also clean up meal plan references
      const newPlan = { ...mealPlan };
      Object.keys(newPlan).forEach(day => {
        Object.keys(newPlan[day]).forEach(slot => {
          newPlan[day][slot] = newPlan[day][slot].filter(recipeId => recipeId !== id);
        });
      });
      setMealPlan(newPlan);
    }
  };

  const handleUpdateMealPlan = (day: string, slot: string, recipeIds: string[]) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: recipeIds
      }
    }));
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingRecipe(null);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto bg-white shadow-2xl relative overflow-hidden ring-1 ring-gray-100 pb-24">
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -z-10 opacity-60" />
      <div className="absolute bottom-20 left-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-60" />

      <main className="flex-1 flex flex-col p-6">
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="relative">
              <div className="bg-green-600 p-6 rounded-[2.5rem] shadow-2xl shadow-green-200">
                <ChefHat className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-100 p-2 rounded-xl border-2 border-white shadow-sm">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-black text-green-900 tracking-tight">Meal Prep-VM</h1>
              <p className="text-green-700 font-bold tracking-widest uppercase text-xs mt-2">Vitality & Macros</p>
            </div>

            <div className="flex flex-col gap-4 w-full px-8">
              <button 
                onClick={() => setActiveTab('recipes')}
                className="group flex items-center justify-center gap-3 bg-green-900 text-white px-8 py-5 rounded-[2rem] font-bold shadow-xl hover:bg-green-800 active:scale-95 transition-all"
              >
                Browse Recipes
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setActiveTab('mealplan')}
                className="group flex items-center justify-center gap-3 bg-white text-green-900 border-2 border-green-900 px-8 py-5 rounded-[2rem] font-bold shadow-sm hover:bg-green-50 active:scale-95 transition-all"
              >
                Plan Your Week
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="animate-in slide-in-from-right duration-500">
            <header className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Recipes</h2>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">Macro-Optimized Catalog</p>
              </div>
              <button 
                onClick={handleAddNew}
                className="p-3 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-200 active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            </header>
            <div className="overflow-x-auto -mx-6 px-6">
              <RecipesTab 
                recipes={recipes} 
                onEdit={handleEditRecipe} 
                onDelete={handleDeleteRecipe} 
              />
            </div>
          </div>
        )}

        {activeTab === 'mealplan' && (
          <MealPlanTab 
            recipes={recipes} 
            mealPlan={mealPlan} 
            onUpdatePlan={handleUpdateMealPlan} 
          />
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <header>
              <h2 className="text-2xl font-bold text-gray-900">App Setup</h2>
              <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">Preferences & Info</p>
            </header>
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
               <div className="flex items-center justify-between">
                 <span className="font-bold text-gray-700">Metric Units</span>
                 <div className="w-12 h-6 bg-green-500 rounded-full relative">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                 </div>
               </div>
            </div>
            <div className="p-8 text-center text-gray-300">
              <p className="text-[10px] font-bold uppercase tracking-widest">Meal Prep-VM v1.5.0</p>
            </div>
          </div>
        )}
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {isFormOpen && (
        <RecipeForm 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSaveRecipe} 
          initialData={editingRecipe} 
        />
      )}
    </div>
  );
};

export default App;