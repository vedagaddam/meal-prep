
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
    <div className="inline-block min-w-full align-middle">
      <div className="overflow-hidden border border-gray-100 rounded-[2rem] shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Recipe</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Advance Prep</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Ingredients</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Macros</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {recipes.map((recipe) => (
              <tr key={recipe.id} className="hover:bg-green-50/30 transition-colors">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-gray-900">{recipe.name}</div>
                      {recipe.synced ? (
                        <Cloud className="w-3 h-3 text-green-500" />
                      ) : (
                        /* Fixed: Moved 'title' from Lucide icon component to a wrapping span */
                        <span title="Local only" className="flex items-center">
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
                  <div className="space-y-1.5 min-w-[140px]">
                    {recipe.prepTasks && recipe.prepTasks.length > 0 ? (
                      recipe.prepTasks.map((prep, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="font-bold text-gray-700">{prep.task}:</span>
                          <span className="italic">{prep.duration}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-300 italic">No advance prep</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <ul className="text-xs text-gray-500 space-y-1 min-w-[180px]">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex justify-between gap-4">
                        <span className="font-medium text-gray-700">{ing.item}</span>
                        <span className="text-gray-400 whitespace-nowrap italic">{ing.quantity} {ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="grid grid-cols-2 gap-1.5 w-32">
                    <MacroBadge label="Cal" val={recipe.macros.calories} />
                    <MacroBadge label="Pro" val={recipe.macros.protein} suffix="g" />
                    <MacroBadge label="Car" val={recipe.macros.carbs} suffix="g" />
                    <MacroBadge label="Fat" val={recipe.macros.fat} suffix="g" />
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
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
    </div>
  );
};

const MacroBadge: React.FC<{ label: string; val: number; suffix?: string }> = ({ label, val, suffix = '' }) => (
  <div className="flex flex-col bg-gray-50 px-2 py-1 rounded-lg">
    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
    <span className="text-[11px] font-black text-gray-800">{val}{suffix}</span>
  </div>
);

export default RecipesTab;
