
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, User, Zap, Droplets, Flame, Pizza, Carrot, BarChart3, Calendar as CalendarIcon, Utensils, Clock } from 'lucide-react';
import { Recipe, TimeSlot, MealPlan, UserProfile, PlannedMeal, PrepTask } from '../App';

interface MealPlanTabProps {
  recipes: Recipe[];
  mealPlan: MealPlan;
  onUpdatePlan: (date: string, slot: string, meals: PlannedMeal[]) => void;
}

const SLOTS: TimeSlot[] = ['Pre-Breakfast', 'Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Post-Dinner'];

const MealPlanTab: React.FC<MealPlanTabProps> = ({ recipes, mealPlan, onUpdatePlan }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectingSlot, setSelectingSlot] = useState<TimeSlot | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile>('V');

  // Helper to format date for keys and display
  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];
  const activeDateKey = formatDateKey(selectedDate);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const jumpToToday = () => setSelectedDate(new Date());

  // Generate a strip of dates (current week) for the UI
  const weekStrip = useMemo(() => {
    const strip = [];
    const base = new Date(selectedDate);
    // Get start of week (Sunday)
    const day = base.getDay();
    const diff = base.getDate() - day;
    const startOfWeek = new Date(base.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      strip.push(d);
    }
    return strip;
  }, [selectedDate]);

  const addRecipeToSlot = (recipeId: string) => {
    if (!selectingSlot) return;
    const currentMeals = mealPlan[activeDateKey]?.[selectingSlot] || [];
    
    const alreadyAdded = currentMeals.some(m => m.recipeId === recipeId && m.profile === activeProfile);
    
    if (!alreadyAdded) {
      onUpdatePlan(activeDateKey, selectingSlot, [...currentMeals, { recipeId, profile: activeProfile }]);
    }
    setSelectingSlot(null);
  };

  const removeRecipeFromSlot = (slot: TimeSlot, recipeId: string, profile: UserProfile) => {
    const currentMeals = mealPlan[activeDateKey]?.[slot] || [];
    onUpdatePlan(activeDateKey, slot, currentMeals.filter(m => !(m.recipeId === recipeId && m.profile === profile)));
  };

  // Macro Totals for the active date
  const dailyTotals = useMemo(() => {
    const v = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const m = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    
    const dayPlan = mealPlan[activeDateKey] || {};
    Object.values(dayPlan).forEach(meals => {
      meals.forEach(meal => {
        const recipe = recipes.find(r => r.id === meal.recipeId);
        if (recipe) {
          const target = meal.profile === 'V' ? v : m;
          target.calories += recipe.macros.calories || 0;
          target.protein += recipe.macros.protein || 0;
          target.carbs += recipe.macros.carbs || 0;
          target.fat += recipe.macros.fat || 0;
          target.fiber += recipe.macros.fiber || 0;
        }
      });
    });
    return { V: v, M: m };
  }, [activeDateKey, mealPlan, recipes]);

  // Next Day Prep Tasks Extraction
  const nextDayPrepTasks = useMemo(() => {
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = formatDateKey(tomorrow);
    const tomorrowPlan = mealPlan[tomorrowKey];
    
    if (!tomorrowPlan) return [];

    const tasks: { recipeName: string; task: string; duration: string }[] = [];
    const processedRecipeIds = new Set<string>();

    Object.values(tomorrowPlan).forEach(meals => {
      meals.forEach(meal => {
        if (!processedRecipeIds.has(meal.recipeId)) {
          const recipe = recipes.find(r => r.id === meal.recipeId);
          if (recipe && recipe.prepTasks && recipe.prepTasks.length > 0) {
            recipe.prepTasks.forEach(pt => {
              tasks.push({ recipeName: recipe.name, task: pt.task, duration: pt.duration });
            });
          }
          processedRecipeIds.add(meal.recipeId);
        }
      });
    });
    return tasks;
  }, [selectedDate, mealPlan, recipes]);

  return (
    <div className="animate-in slide-in-from-right duration-500 flex flex-col h-full space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meal Plan</h2>
          <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">Calendar History</p>
        </div>
        
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
              {p}
            </button>
          ))}
        </div>
      </header>

      {/* Date Navigation Strip */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between px-2">
           <button onClick={handlePrevDay} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <button onClick={handleNextDay} className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between gap-1 overflow-x-auto pb-2 scroll-momentum">
          {weekStrip.map((date) => {
            const isSelected = formatDateKey(date) === activeDateKey;
            const isToday = formatDateKey(date) === formatDateKey(new Date());
            return (
              <button
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={`flex-1 min-w-[3.5rem] flex flex-col items-center py-3 rounded-2xl transition-all ${
                  isSelected 
                    ? 'bg-green-600 text-white shadow-lg scale-105' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-tighter mb-1">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-base font-black leading-none">{date.getDate()}</span>
                {isToday && !isSelected && <div className="w-1 h-1 bg-green-500 rounded-full mt-1" />}
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={jumpToToday}
          className="w-full py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
        >
          <CalendarIcon className="w-3 h-3" /> Jump to Today
        </button>
      </div>

      {/* Daily Nutrition Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileSummary profile="V" totals={dailyTotals.V} color="indigo" />
        <ProfileSummary profile="M" totals={dailyTotals.M} color="emerald" />
      </div>

      {/* Slots List */}
      <div className="space-y-4">
        {SLOTS.map(slot => {
          const plannedMeals = mealPlan[activeDateKey]?.[slot] || [];

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
                    const isEatOut = recipe.type === 'EatOut';
                    
                    return (
                      <div 
                        key={`${meal.recipeId}-${meal.profile}-${idx}`} 
                        className={`group relative flex items-center gap-2 pr-8 pl-2 py-1.5 rounded-full border transition-all ${
                          isV 
                            ? 'bg-indigo-50 border-indigo-100' 
                            : 'bg-emerald-50 border-emerald-100'
                        } ${isEatOut ? 'text-red-600 ring-1 ring-red-100' : (isV ? 'text-indigo-800' : 'text-emerald-800')}`}
                      >
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${
                          isV ? 'bg-indigo-200' : 'bg-emerald-200'
                        } ${isEatOut ? 'bg-red-50 text-red-600' : ''}`}>
                          {isEatOut ? <Utensils className="w-2.5 h-2.5" /> : meal.profile}
                        </div>
                        <span className={`text-[11px] ${isEatOut ? 'font-black' : 'font-bold'}`}>
                          {recipe.name}
                        </span>
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
                  <span className="text-[10px] text-gray-300 italic font-medium">No meals planned</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Prep for Tomorrow Section */}
        {nextDayPrepTasks.length > 0 && (
          <div className="bg-amber-50/30 border border-amber-100 rounded-[2rem] p-6 shadow-sm animate-in fade-in zoom-in-95 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900 uppercase tracking-widest leading-none">Prep for Tomorrow</p>
                <p className="text-[10px] text-amber-600/70 font-bold uppercase tracking-tighter mt-1">Don't forget to soak or ferment!</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {nextDayPrepTasks.map((pt, idx) => (
                <div key={idx} className="bg-white/80 p-3 rounded-xl border border-amber-50 flex justify-between items-center shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-tight mb-0.5">{pt.recipeName}</span>
                    <span className="text-xs font-bold text-gray-700">{pt.task}</span>
                  </div>
                  <span className="text-[9px] font-black text-amber-700 uppercase bg-amber-50 px-2 py-1 rounded-full">{pt.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
                  Adding for <span className={activeProfile === 'V' ? 'text-indigo-600' : 'text-emerald-600'}>Profile {activeProfile}</span>
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
                      <div className={`text-sm font-bold flex items-center gap-2 ${activeProfile === 'V' ? 'group-hover:text-indigo-700' : 'group-hover:text-emerald-700'} ${recipe.type === 'EatOut' ? 'text-red-600' : 'text-gray-900'}`}>
                        {recipe.name}
                        {recipe.type === 'EatOut' && <Utensils className="w-3 h-3" />}
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
                  <p className="text-sm text-gray-400">No recipes found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileSummary: React.FC<{ profile: string; totals: any; color: 'indigo' | 'emerald' }> = ({ profile, totals, color }) => {
  const isV = profile === 'V';
  const themeClass = isV ? 'bg-indigo-50 border-indigo-100 text-indigo-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900';
  const barClass = isV ? 'bg-indigo-600' : 'bg-emerald-600';
  
  // Custom targets per profile
  const targets = profile === 'V' 
    ? { calories: 2200, protein: 75, carbs: 300, fat: 50, fiber: 25 }
    : { calories: 2600, protein: 100, carbs: 300, fat: 60, fiber: 34 };

  return (
    <div className={`p-5 rounded-[2.5rem] border ${themeClass} shadow-sm space-y-5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${barClass}`}>
            {profile}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Dominant Macros</span>
        </div>
        <BarChart3 className="w-3.5 h-3.5 opacity-20" />
      </div>

      <div className="space-y-4">
        {/* Dominant Macros: Protein and Fiber */}
        <MacroProgressBar label="Protein" val={totals.protein} target={targets.protein} barClass={barClass} suffix="g" />
        <MacroProgressBar label="Fiber" val={totals.fiber} target={targets.fiber} barClass={barClass} suffix="g" />
        
        {/* Secondary Grid: Calories, Carbs, Fat */}
        <div className="grid grid-cols-3 gap-x-2 gap-y-4 pt-2 border-t border-black/5">
          <MacroProgressBar label="Calories" val={totals.calories} target={targets.calories} barClass={barClass} suffix="" small />
          <MacroProgressBar label="Carbs" val={totals.carbs} target={targets.carbs} barClass={barClass} suffix="g" small />
          <MacroProgressBar label="Fat" val={totals.fat} target={targets.fat} barClass={barClass} suffix="g" small />
        </div>
      </div>
    </div>
  );
};

const MacroProgressBar: React.FC<{ 
  label: string; 
  val: number; 
  target: number; 
  barClass: string; 
  suffix: string;
  small?: boolean;
}> = ({ label, val, target, barClass, suffix, small }) => {
  const percent = Math.min(100, (val / target) * 100);
  const isOver = val > target;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className={`${small ? 'text-[8px]' : 'text-[10px]'} font-bold opacity-40 uppercase tracking-tight`}>{label}</span>
        <div className="flex items-baseline gap-0.5">
          <span className={`${small ? 'text-xs' : 'text-base'} font-black leading-none ${isOver ? 'text-red-600' : ''}`}>
            {val}
          </span>
          <span className="text-[9px] opacity-40 font-bold">{suffix}</span>
        </div>
      </div>
      <div className={`${small ? 'h-1' : 'h-1.5'} bg-white/50 rounded-full overflow-hidden relative`}>
        <div 
          className={`h-full ${isOver ? 'bg-red-500' : barClass} transition-all duration-700 ease-out rounded-full`} 
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
};

export default MealPlanTab;
