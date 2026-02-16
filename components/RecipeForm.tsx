
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Clock } from 'lucide-react';
import { Recipe, Ingredient, PrepTask } from '../App';

interface RecipeFormProps {
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialData: Recipe | null;
}

const STORES = ['Costco', "Trader Joe's", 'Whole Foods', 'Manpasand', 'HEB', 'Meat Market', 'Other'];

const RecipeForm: React.FC<RecipeFormProps> = ({ onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>('Easy');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [prepTasks, setPrepTasks] = useState<PrepTask[]>([]);
  const [macros, setMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDifficulty(initialData.difficulty);
      setIngredients([...initialData.ingredients]);
      setPrepTasks([...(initialData.prepTasks || [])]);
      setMacros({ ...initialData.macros });
    } else {
      setIngredients([{ item: '', quantity: 1, unit: 'item', storeName: 'Other' }]);
      setPrepTasks([]);
    }
  }, [initialData]);

  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', quantity: 1, unit: 'item', storeName: 'Other' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngs = [...ingredients];
    newIngs[index] = { ...newIngs[index], [field]: value };
    setIngredients(newIngs);
  };

  const addPrepTask = () => {
    setPrepTasks([...prepTasks, { task: '', duration: '' }]);
  };

  const removePrepTask = (index: number) => {
    setPrepTasks(prepTasks.filter((_, i) => i !== index));
  };

  const updatePrepTask = (index: number, field: keyof PrepTask, value: string) => {
    const newTasks = [...prepTasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setPrepTasks(newTasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0) {
      alert('Please add at least one ingredient');
      return;
    }
    const newRecipe: Recipe = {
      id: initialData?.id || Date.now().toString(),
      name,
      difficulty,
      ingredients,
      prepTasks,
      macros
    };
    onSave(newRecipe);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <form 
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300 overflow-y-auto max-h-[95vh] scroll-momentum"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit Recipe' : 'New Recipe'}</h2>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">Detail Entry</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="space-y-8 pb-10">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recipe Name</label>
              <input 
                required
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-green-500 transition-all font-medium text-base"
                placeholder="e.g. Quinoa Salad"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Difficulty</label>
              <div className="flex gap-2 h-14">
                {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 rounded-2xl text-xs font-bold transition-all ${
                      difficulty === d 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                      : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advance Prep */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Advance Prep (Soak/Ferment)</label>
              <button 
                type="button" 
                onClick={addPrepTask}
                className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-wider hover:bg-amber-50 px-3 py-2 rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" /> Add Task
              </button>
            </div>
            <div className="space-y-3">
              {prepTasks.map((prep, idx) => (
                <div key={idx} className="flex gap-2 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex-[2] relative">
                    <Clock className="absolute left-3 top-3.5 w-4 h-4 text-amber-300 pointer-events-none" />
                    <input 
                      required
                      className="w-full bg-gray-50 border-0 rounded-xl p-3.5 pl-10 text-base focus:ring-2 focus:ring-amber-500"
                      placeholder="Task"
                      value={prep.task}
                      onChange={e => updatePrepTask(idx, 'task', e.target.value)}
                    />
                  </div>
                  <input 
                    required
                    className="flex-1 bg-gray-50 border-0 rounded-xl p-3.5 text-base focus:ring-2 focus:ring-amber-500 text-center"
                    placeholder="Time"
                    value={prep.duration}
                    onChange={e => updatePrepTask(idx, 'duration', e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => removePrepTask(idx)}
                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {prepTasks.length === 0 && (
                <p className="text-[10px] text-gray-400 italic px-2">No advance prep required.</p>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ingredients List</label>
              <button 
                type="button" 
                onClick={addIngredient}
                className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-wider hover:bg-green-50 px-3 py-2 rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-4">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="bg-gray-50/50 p-4 rounded-[1.5rem] border border-gray-100/50 space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex gap-2">
                    <input 
                      required
                      className="flex-1 bg-white border border-gray-100 rounded-xl p-3 text-base focus:ring-2 focus:ring-green-500"
                      placeholder="Item name"
                      value={ing.item}
                      onChange={e => updateIngredient(idx, 'item', e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      required
                      type="number"
                      step="any"
                      className="w-20 bg-white border border-gray-100 rounded-xl p-3 text-base focus:ring-2 focus:ring-green-500 text-center"
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={e => updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                    <select 
                      className="w-24 bg-white border border-gray-100 rounded-xl p-3 text-base focus:ring-2 focus:ring-green-500 appearance-none"
                      value={ing.unit}
                      onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                    >
                      <option value="item">item</option>
                      <option value="cup">cup</option>
                      <option value="cups">cups</option>
                      <option value="grams">grams</option>
                      <option value="kg">kg</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="ml">ml</option>
                      <option value="liter">liter</option>
                    </select>
                    <select 
                      className="flex-1 bg-white border border-gray-100 rounded-xl p-3 text-base focus:ring-2 focus:ring-green-500 appearance-none"
                      value={ing.storeName || 'Other'}
                      onChange={e => updateIngredient(idx, 'storeName', e.target.value)}
                    >
                      {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Macros */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Nutritional Macros</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MacroInput label="Calories" val={macros.calories} onChange={v => setMacros({...macros, calories: v})} color="gray" />
              <MacroInput label="Protein (g)" val={macros.protein} onChange={v => setMacros({...macros, protein: v})} color="green" />
              <MacroInput label="Carbs (g)" val={macros.carbs} onChange={v => setMacros({...macros, carbs: v})} color="amber" />
              <MacroInput label="Fat (g)" val={macros.fat} onChange={v => setMacros({...macros, fat: v})} color="red" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-green-900 text-white py-5 rounded-[2rem] font-bold flex items-center justify-center gap-2 mt-8 hover:bg-green-800 shadow-xl active:scale-[0.98] transition-all"
          >
            <Save className="w-5 h-5" />
            {initialData ? 'Update Recipe' : 'Save Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

const MacroInput: React.FC<{ label: string; val: number; onChange: (v: number) => void; color: 'gray' | 'green' | 'amber' | 'red' }> = ({ label, val, onChange, color }) => {
  const bgColors = {
    gray: 'bg-gray-50 focus-within:ring-gray-200',
    green: 'bg-green-50 focus-within:ring-green-200',
    amber: 'bg-amber-50 focus-within:ring-amber-200',
    red: 'bg-red-50 focus-within:ring-red-200'
  };
  return (
    <div className={`${bgColors[color]} p-4 rounded-2xl transition-all ring-inset`}>
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{label}</label>
      <input 
        type="number"
        className="w-full bg-transparent border-0 p-0 text-xl font-black focus:ring-0 text-gray-900"
        value={val}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
};

export default RecipeForm;
