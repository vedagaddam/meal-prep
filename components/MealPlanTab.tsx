import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Recipe, DayOfWeek, TimeSlot, MealPlan } from '../App';

interface MealPlanTabProps {
  recipes: Recipe[];
  mealPlan: MealPlan;
  onUpdatePlan: (day: string, slot: string, recipeIds: string[]) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS: TimeSlot[] = ['Pre-Breakfast', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Post-Dinner'];

const MealPlanTab: React.FC<MealPlanTabProps> = ({ recipes, mealPlan, onUpdatePlan }) => {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [selectingSlot, setSelectingSlot] = useState<TimeSlot | null>(null);

  const activeDay = DAYS[activeDayIdx];

  const handlePrevDay = () => setActiveDayIdx(prev => (prev === 0 ? 6 : prev - 1));
  const handleNextDay = () => setActiveDayIdx(prev => (prev === 6 ? 0 : prev + 1));

  const addRecipeToSlot = (recipeId: string) => {
    if (!selectingSlot) return;
    const currentRecipes = mealPlan[activeDay]?.[selectingSlot] || [];
    if (!currentRecipes.includes(recipeId)) {
      onUpdatePlan(activeDay, selectingSlot, [...currentRecipes, recipeId]);
    }
    setSelectingSlot(null);
  };

  const removeRecipeFromSlot = (slot: TimeSlot, recipeId: string) => {
    const currentRecipes = mealPlan[activeDay]?.[slot] || [];
    onUpdatePlan(activeDay, slot, currentRecipes.filter(id => id !== recipeId));
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 flex flex-col h-full">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Plan</h2>
          <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">Nourishment Schedule</p>
        </div>
      </header>

      {/* Day Selector */}
      <div className="flex items-center justify-between bg-green-50/50 p-4 rounded-[2rem] mb-6 border border-green-100">
        <button onClick={handlePrevDay} className="p-2 hover:bg-white rounded-full transition-all text-green-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <span className="text-lg font-black text-green-900 tracking-tight">{activeDay}</span>
        </div>
        <button onClick={handleNextDay} className="p-2 hover:bg-white rounded-full transition-all text-green-700">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slots List */}
      <div className="space-y-4 flex-1">
        {SLOTS.map(slot => {
          const selectedRecipeIds = mealPlan[activeDay]?.[slot] || [];
          const slotRecipes = selectedRecipeIds.map(id => recipes.find(r => r.id === id)).filter(Boolean) as Recipe[];

          return (
            <div key={slot} className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{slot}</span>
                </div>
                <button 
                  onClick={() => setSelectingSlot(slot)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {slotRecipes.length > 0 ? (
                  slotRecipes.map(recipe => (
                    <div key={recipe.id} className="group relative flex items-center gap-2 bg-gray-50 pr-8 pl-3 py-1.5 rounded-full border border-gray-100">
                      <span className="text-xs font-bold text-gray-700">{recipe.name}</span>
                      <button 
                        onClick={() => removeRecipeFromSlot(slot, recipe.id)}
                        className="absolute right-1 p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-300 italic font-medium">No meals planned for this slot</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Picker Modal */}
      {selectingSlot && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectingSlot(null)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Select Recipe</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Adding to {selectingSlot}</p>
              </div>
              <button onClick={() => setSelectingSlot(null)} className="p-2 hover:bg-gray-50 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {recipes.length > 0 ? (
                recipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => addRecipeToSlot(recipe.id)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors group text-left"
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-900 group-hover:text-green-700">{recipe.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{recipe.macros.calories} kcal • {recipe.difficulty}</div>
                    </div>
                    <Plus className="w-4 h-4 text-gray-300 group-hover:text-green-600" />
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No recipes found. Go to the Recipes tab to create some first!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanTab;