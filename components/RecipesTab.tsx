
import React from 'react';
import { Recipe } from '../App';
import { Edit2, Trash2, Clock, Cloud, CloudOff, Zap, Droplets, Flame, Pizza } from 'lucide-react';

interface RecipesTabProps {
  recipes: Recipe[];
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

const RecipesTab: React.FC<RecipesTabProps> = ({ recipes, onEdit, onDelete }) => {
  return (
    <div className="w-full space-y-6">
      {recipes.map((recipe) => (
        <div 
          key={recipe.id} 
          className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Header Section */}
          <div className="p-6 pb-4 flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900 truncate">{recipe.name}</h3>
                {recipe.synced ? (
                  <Cloud className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <CloudOff className="w-4 h-4 text-gray-300 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  recipe.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {recipe.difficulty}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {recipe.ingredients.length} Ingredients
                </span>
              </div>
            </div>
            
            <div className="flex gap-1 ml-4 shrink-0">
              <button 
                onClick={() => onEdit(recipe)}
                className="p-3 bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all"
              >
                <Edit2 className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => onDelete(recipe.id)}
                className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Macros Strip */}
          <div className="px-6 py-3 bg-gray-50/50 flex justify-around border-y border-gray-50">
            <MacroIconBadge icon={Flame} label="Cal" val={recipe.macros.calories} color="gray" />
            <MacroIconBadge icon={Zap} label="Pro" val={recipe.macros.protein} suffix="g" color="green" />
            <MacroIconBadge icon={Pizza} label="Car" val={recipe.macros.carbs} suffix="g" color="amber" />
            <MacroIconBadge icon={Droplets} label="Fat" val={recipe.macros.fat} suffix="g" color="rose" />
          </div>

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Advance Prep */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock className="w-3 h-3 text-amber-500" /> Advance Prep
              </h4>
              <div className="space-y-2">
                {recipe.prepTasks && recipe.prepTasks.length > 0 ? (
                  recipe.prepTasks.map((prep, idx) => (
                    <div key={idx} className="bg-amber-50/50 p-3 rounded-2xl flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700">{prep.task}</span>
                      <span className="text-[10px] font-black text-amber-600 uppercase bg-white px-2 py-0.5 rounded-full shadow-sm">{prep.duration}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 italic">No advance prep tasks.</p>
                )}
              </div>
            </div>

            {/* Ingredients Preview */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ingredients Preview</h4>
              <div className="grid grid-cols-1 gap-1.5">
                {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 truncate mr-2">{ing.item}</span>
                    <span className="text-gray-400 font-medium shrink-0 italic">{ing.quantity} {ing.unit}</span>
                  </div>
                ))}
                {recipe.ingredients.length > 4 && (
                  <p className="text-[10px] text-green-600 font-bold mt-1">+ {recipe.ingredients.length - 4} more items...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {recipes.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm font-medium">Your catalog is empty.</p>
          <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Add your first recipe to begin</p>
        </div>
      )}
    </div>
  );
};

const MacroIconBadge: React.FC<{ icon: any; label: string; val: number; suffix?: string; color: 'gray' | 'green' | 'amber' | 'rose' }> = ({ icon: Icon, label, val, suffix = '', color }) => {
  const colors = {
    gray: 'text-gray-400',
    green: 'text-green-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500'
  };
  return (
    <div className="flex flex-col items-center">
      <div className={`p-1.5 rounded-lg mb-1 ${colors[color]} bg-white shadow-sm`}>
        <Icon className="w-3 h-3" />
      </div>
      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{label}</span>
      <span className="text-[11px] font-black text-gray-800 leading-none mt-0.5">{val}{suffix}</span>
    </div>
  );
};

export default RecipesTab;
