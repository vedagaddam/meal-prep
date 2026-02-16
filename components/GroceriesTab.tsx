
import React, { useMemo, useState } from 'react';
import { ShoppingBag, CheckCircle2, Circle, Leaf, RefreshCw, Store } from 'lucide-react';
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

  const groceryGroups = useMemo(() => {
    const aggregate: Record<string, { item: string; quantity: number; unit: string; storeName: string }> = {};

    // Iterate through all days and slots in the meal plan
    Object.values(mealPlan).forEach((dayPlan) => {
      Object.values(dayPlan).forEach((meals) => {
        meals.forEach((meal) => {
          const recipe = recipes.find((r) => r.id === meal.recipeId);
          if (recipe) {
            recipe.ingredients.forEach((ing) => {
              const store = ing.storeName || 'General';
              // Create a key based on item name, unit, and store to group properly
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
    });

    // Group items by store
    const groups: Record<string, AggregateIngredient[]> = {};
    Object.entries(aggregate).forEach(([id, ing]) => {
      const store = ing.storeName || 'General';
      if (!groups[store]) groups[store] = [];
      groups[store].push({ ...ing, id, checked: checkedItems.has(id) });
    });

    // Sort items within each group
    Object.keys(groups).forEach(store => {
      groups[store].sort((a, b) => a.item.localeCompare(b.item));
    });

    return groups;
  }, [mealPlan, recipes, checkedItems]);

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const clearChecked = () => {
    setCheckedItems(new Set());
  };

  const stores = Object.keys(groceryGroups).sort();
  const totalItems = Object.values(groceryGroups).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grocery List</h2>
          <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">Grouped by Store</p>
        </div>
        {checkedItems.size > 0 && (
          <button 
            onClick={clearChecked}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-400 hover:text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        )}
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
                      {!ing.checked && <Leaf className="w-4 h-4 text-green-100 group-hover:text-green-200 transition-colors" />}
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

      {totalItems > 0 && (
        <div className="bg-green-900/5 p-6 rounded-[2.5rem] border border-green-900/10 flex items-center gap-4">
          <Leaf className="w-8 h-8 text-green-700 shrink-0" />
          <p className="text-[11px] text-green-800 leading-relaxed font-medium">
            Items are now grouped by store to make your shopping trip more efficient. Total of {totalItems} items to collect.
          </p>
        </div>
      )}
    </div>
  );
};

export default GroceriesTab;
