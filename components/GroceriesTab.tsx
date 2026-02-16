
import React, { useMemo, useState } from 'react';
import { ShoppingBag, CheckCircle2, Circle, Leaf, RefreshCw, Store, Calendar } from 'lucide-react';
import { Recipe, MealPlan, Ingredient } from '../App';

interface GroceriesTabProps {
  recipes: Recipe[];
  mealPlan: MealPlan;
}

interface AggregateIngredient extends Ingredient {
  id: string;
  checked: boolean;
}

const GroceriesTab: React.FC<GroceriesTabProps> = ({ recipes, mealPlan }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [daysToLookAhead, setDaysToLookAhead] = useState(7);

  const groceryGroups = useMemo(() => {
    const aggregate: Record<string, { item: string; quantity: number; unit: string; storeName: string }> = {};
    
    // Calculate dates for the window (Today + X days)
    const datesToFetch = [];
    const today = new Date();
    for (let i = 0; i < daysToLookAhead; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      datesToFetch.push(d.toISOString().split('T')[0]);
    }

    // Iterate through specified date range in the meal plan
    datesToFetch.forEach((dateStr) => {
      const dayPlan = mealPlan[dateStr];
      if (dayPlan) {
        Object.values(dayPlan).forEach((meals) => {
          meals.forEach((meal) => {
            const recipe = recipes.find((r) => r.id === meal.recipeId);
            if (recipe) {
              recipe.ingredients.forEach((ing) => {
                const store = ing.storeName || 'General';
                const key = `${ing.item.toLowerCase()}-${ing.unit.toLowerCase()}-${store.toLowerCase()}`;
                if (aggregate[key]) {
                  aggregate[key].quantity += ing.quantity;
                } else {
                  aggregate[key] = { ...ing, storeName: store };
                }
              });
            }
          });
        });
      }
    });

    const groups: Record<string, AggregateIngredient[]> = {};
    Object.entries(aggregate).forEach(([id, ing]) => {
      const store = ing.storeName || 'General';
      if (!groups[store]) groups[store] = [];
      groups[store].push({ ...ing, id, checked: checkedItems.has(id) });
    });

    Object.keys(groups).forEach(store => {
      groups[store].sort((a, b) => a.item.localeCompare(b.item));
    });

    return groups;
  }, [mealPlan, recipes, checkedItems, daysToLookAhead]);

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const clearChecked = () => setCheckedItems(new Set());

  const stores = Object.keys(groceryGroups).sort();
  const totalItems = Object.values(groceryGroups).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grocery List</h2>
          <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">Next {daysToLookAhead} Days</p>
        </div>
        <div className="flex gap-2">
          {checkedItems.size > 0 && (
            <button 
              onClick={clearChecked}
              className="p-2 bg-gray-50 text-gray-400 hover:text-green-600 rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <select 
            value={daysToLookAhead}
            onChange={(e) => setDaysToLookAhead(parseInt(e.target.value))}
            className="bg-gray-100 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-3 py-2 outline-none"
          >
            <option value={3}>3 Days</option>
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
          </select>
        </div>
      </header>

      {stores.length > 0 ? (
        <div className="space-y-8">
          {stores.map(store => (
            <div key={store} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{store}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {groceryGroups[store].filter(i => i.checked).length} / {groceryGroups[store].length} Items
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  {groceryGroups[store].map((ing) => (
                    <button
                      key={ing.id}
                      onClick={() => toggleItem(ing.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group text-left ${
                        ing.checked ? 'bg-gray-50/50 opacity-60' : 'hover:bg-green-50'
                      }`}
                    >
                      <div className={`shrink-0 transition-colors ${ing.checked ? 'text-green-500' : 'text-gray-300 group-hover:text-green-400'}`}>
                        {ing.checked ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${ing.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {ing.item}
                        </p>
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-tighter">
                          {ing.quantity % 1 === 0 ? ing.quantity : ing.quantity.toFixed(2)} {ing.unit}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-200" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Your grocery list is empty.</p>
          <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1 px-8 text-center">
            Plan some meals in the Plan tab to automatically generate your list.
          </p>
        </div>
      )}
    </div>
  );
};

export default GroceriesTab;
