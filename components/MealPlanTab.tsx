import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, User } from 'lucide-react';
import { Recipe, DayOfWeek, TimeSlot, MealPlan, UserProfile, PlannedMeal } from '../App';

interface MealPlanTabProps {
  recipes: Recipe[];
  mealPlan: MealPlan;
  onUpdatePlan: (day: string, slot: string, meals: PlannedMeal[]) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS: TimeSlot[] = ['Pre-Breakfast', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Post-Dinner'];

const MealPlanTab: React.FC<MealPlanTabProps> = ({ recipes, mealPlan, onUpdatePlan }) => {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [selectingSlot, setSelectingSlot] = useState<TimeSlot | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile>('V');

  const activeDay = DAYS[activeDayIdx];

  const handlePrevDay = () => setActiveDayIdx(prev => (prev === 0 ? 6 : prev - 1));
  const handleNextDay = () => setActiveDayIdx(prev => (prev === 6 ? 0 : prev + 1));

  const addRecipeToSlot = (recipeId: string) => {
    if (!selectingSlot) return;
    const currentMeals = mealPlan[activeDay]?.[selectingSlot] || [];
    
    // Check if this recipe for this profile is already added
    const alreadyAdded = currentMeals.some(m => m.recipeId === recipeId && m.profile === activeProfile);
    
    if (!alreadyAdded) {
      onUpdatePlan(activeDay, selectingSlot, [...currentMeals, { recipeId, profile: activeProfile }]);
    }
    setSelectingSlot(null);
  };

  const removeRecipeFromSlot = (slot: TimeSlot, recipeId: string, profile: UserProfile) => {
    const currentMeals = mealPlan[activeDay]?.[slot] || [];
    onUpdatePlan(activeDay, slot, currentMeals.filter(m => !(m.recipeId === recipeId && m.profile === profile)));
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 flex flex-col h-full">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Plan</h2>
          <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">Dual Profile Tracker</p>
        </div>
        
        {/* Profile Selector */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          {(['V', 'M'] as UserProfile[]).map(p => (
            <button
              key={p}
              onClick={() => setActiveProfile(p)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeProfile === p 
                  ? (p === 'V' ? 'bg-indigo-600 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md')
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <User className="w-3 h-3" />
              Profile {p}
            </button>
          ))}
        </div>
      </header>

      {/* Day Selector */}
      <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] mb-6 border border-gray-100 shadow-sm">
        <button onClick={handlePrevDay} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <span className="text-lg font-black text-gray-900 tracking-tight">{activeDay}</span>
        </div>
        <button onClick={handleNextDay} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slots List */}
      <div className="space-y-4 flex-1">
        {SLOTS.map(slot => {
          const plannedMeals = mealPlan[activeDay]?.[slot] || [];

          return (
            <div key={slot} className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{slot}</span>
                </div>
                <button 
                  onClick={() => setSelectingSlot(slot)}
                  className={`p-2 rounded-xl transition-all ${
                    activeProfile === 'V' ? 'text-indigo-600 hover:bg-indigo-50' : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {plannedMeals.length > 0 ? (
                  plannedMeals.map((meal, idx) => {
                    const recipe = recipes.find(r => r.id === meal.recipeId);
                    if (!recipe) return null;
                    const isV = meal.profile === 'V';
                    return (
                      <div 
                        key={`${meal.recipeId}-${meal.profile}-${idx}`} 
                        className={`group relative flex items-center gap-2 pr-8 pl-2 py-1.5 rounded-full border transition-all ${
                          isV 
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-800' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                        }`}
                      >
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${
                          isV ? 'bg-indigo-200' : 'bg-emerald-200'
                        }`}>
                          {meal.profile}
                        </div>
                        <span className="text-[11px] font-bold">{recipe.name}</span>
                        <button 
                          onClick={() => removeRecipeFromSlot(slot, meal.recipeId, meal.profile)}
                          className="absolute right-1 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
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
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Adding to {selectingSlot} for <span className={activeProfile === 'V' ? 'text-indigo-600' : 'text-emerald-600'}>Profile {activeProfile}</span>
                </p>
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
                    className={`w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 transition-all group text-left ${
                      activeProfile === 'V' ? 'hover:bg-indigo-50 hover:ring-1 hover:ring-indigo-100' : 'hover:bg-emerald-50 hover:ring-1 hover:ring-emerald-100'
                    }`}
                  >
                    <div>
                      <div className={`text-sm font-bold text-gray-900 group-hover:${activeProfile === 'V' ? 'text-indigo-700' : 'text-emerald-700'}`}>
                        {recipe.name}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter">
                        {recipe.macros.calories} kcal • {recipe.difficulty}
                      </div>
                    </div>
                    <Plus className={`w-4 h-4 text-gray-300 group-hover:${activeProfile === 'V' ? 'text-indigo-600' : 'text-emerald-600'}`} />
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