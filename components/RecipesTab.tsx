
import React from 'react';
import { Recipe } from '../App';
import { Edit2, Trash2, Clock, Cloud, CloudOff } from 'lucide-react';

interface RecipesTabProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

const RecipesTab: React.FC<RecipesTabProps> = ({ recipes, onEdit, onDelete }) => {
  return (
    <div className="w-full">
      <div className="overflow-x-auto scroll-momentum border border-gray-100 rounded-[2rem] shadow-sm bg-white">
        <table className="min-w-[700px] w-full divide-y divide-gray-100 table-fixed sm:table-auto">
          <thead className="bg-gray-50/50">
            <tr>
              <th scope="col" className="w-1/4 px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Recipe</th>
              <th scope="col" className="w-1/4 px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Advance Prep</th>
              <th scope="col" className="w-1/4 px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Ingredients</th>
              <th scope="col" className="w-1/6 px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Macros</th>
              <th scope="col" className="w-24 px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {recipes.map((recipe) => (
              <tr key={recipe.id} className="hover:bg-green-50/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-gray-900 truncate">{recipe.name}</div>
                      {recipe.synced ? (
                        <Cloud className="w-3 h-3 text-green-500 shrink-0" />
                      ) : (
                        <span title="Local only" className="flex items-center shrink-0">
                          <CloudOff className="w-3 h-3 text-gray-300" />
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider w-fit ${
                      recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      recipe.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-1.5">
                    {recipe.prepTasks && recipe.prepTasks.length > 0 ? (
                      recipe.prepTasks.map((prep, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="font-bold text-gray-700 truncate">{prep.task}:</span>
                          <span className="italic shrink-0">{prep.duration}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-300 italic">No advance prep</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="max-h-24 overflow-y-auto pr-2">
                    <ul className="text-xs text-gray-500 space-y-1">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex justify-between gap-4">
                          <span className="font-medium text-gray-700 truncate">{ing.item}</span>
                          <span className="text-gray-400 whitespace-nowrap italic">{ing.quantity} {ing.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="grid grid-cols-2 gap-1 w-24">
                    <MacroBadge label="Cal" val={recipe.macros.calories} />
                    <MacroBadge label="Pro" val={recipe.macros.protein} suffix="g" />
                    <MacroBadge label="Car" val={recipe.macros.carbs} suffix="g" />
                    <MacroBadge label="Fat" val={recipe.macros.fat} suffix="g" />
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => onEdit(recipe)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(recipe.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {recipes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                  No recipes found. Click the + button to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 sm:hidden">
        <span className="animate-pulse">← Swipe table to see more →</span>
      </div>
    </div>
  );
};

const MacroBadge: React.FC<{ label: string; val: number; suffix?: string }> = ({ label, val, suffix = '' }) => (
  <div className="flex flex-col bg-gray-50 px-1.5 py-0.5 rounded-lg border border-gray-100">
    <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
    <span className="text-[10px] font-black text-gray-800 leading-tight">{val}{suffix}</span>
  </div>
);

export default RecipesTab;
