
import React, { useState, useMemo } from 'react';
import { Plane, CheckCircle2, Circle, Plus, Trash2, User, Filter, Search, ChevronDown, ChevronRight, Maximize2, Minimize2, Edit2, Check, X } from 'lucide-react';
import { TravelChecklistItem, UserProfile } from '../App';

interface TravelTabProps {
  items: TravelChecklistItem[];
  onUpdateItem: (id: string, updates: Partial<TravelChecklistItem>) => void;
  onAddItem: (category: string, item: string) => void;
  onDeleteItem: (id: string) => void;
}

const TravelTab: React.FC<TravelTabProps> = ({ items, onUpdateItem, onAddItem, onDeleteItem }) => {
  const [newCategory, setNewCategory] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryInputs, setCategoryInputs] = useState<{ [key: string]: string }>({});
  
  // Editing states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemValue, setEditItemValue] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.category)));
    return cats.sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: TravelChecklistItem[] } = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedCategories.size === categories.length) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(categories));
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newItemName) return;
    onAddItem(newCategory, newItemName);
    setNewItemName('');
  };

  const handleAddCategoryItem = (category: string) => {
    const name = categoryInputs[category];
    if (!name) return;
    onAddItem(category, name);
    setCategoryInputs(prev => ({ ...prev, [category]: '' }));
  };

  const startEditingItem = (item: TravelChecklistItem) => {
    setEditingItemId(item.id);
    setEditItemValue(item.item);
  };

  const saveItemEdit = (id: string) => {
    if (!editItemValue.trim()) return;
    onUpdateItem(id, { item: editItemValue.trim() });
    setEditingItemId(null);
  };

  const startEditingCategory = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    setEditingCategory(category);
    setEditCategoryValue(category);
  };

  const saveCategoryEdit = (oldCategory: string) => {
    const newVal = editCategoryValue.trim();
    if (!newVal || newVal === oldCategory) {
      setEditingCategory(null);
      return;
    }
    
    // Update all items in this category
    const itemsToUpdate = items.filter(i => i.category === oldCategory);
    itemsToUpdate.forEach(item => {
      onUpdateItem(item.id, { category: newVal });
    });
    
    setEditingCategory(null);
  };

  const getCategoryProgress = (catItems: TravelChecklistItem[]) => {
    const total = catItems.length * 2; // 2 people
    const checked = catItems.reduce((acc, item) => acc + (item.checkedV ? 1 : 0) + (item.checkedM ? 1 : 0), 0);
    return total === 0 ? 0 : Math.round((checked / total) * 100);
  };

  return (
    <div className="space-y-3 pb-20">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tighter">Travel</h2>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Veda & Murali</p>
        </div>
        <Plane className="w-6 h-6 text-indigo-600 opacity-20" />
      </header>

      {/* Search & Toggle All */}
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <button 
          onClick={toggleAll}
          className="bg-white border border-gray-100 p-2 rounded-xl shadow-sm text-gray-400 hover:text-indigo-600 transition-colors active:scale-95"
        >
          {expandedCategories.size === categories.length ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Add New Item Form - Compact */}
      <form onSubmit={handleAddItem} className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-3 space-y-2">
        <div className="flex gap-1.5">
          <input 
            list="categories"
            placeholder="Cat" 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-24 bg-white border border-indigo-100 rounded-lg py-1.5 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <datalist id="categories">
            {categories.map(cat => <option key={cat} value={cat} />)}
          </datalist>
          <input 
            placeholder="Item name" 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 bg-white border border-indigo-100 rounded-lg py-1.5 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button type="submit" className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm active:scale-95 transition-transform">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Checklist Groups - Dense */}
      <div className="space-y-2">
        {Object.entries(groupedItems).map(([category, catItems]) => {
          const isExpanded = expandedCategories.has(category) || searchQuery.length > 0;
          const progress = getCategoryProgress(catItems);
          const isEditingCat = editingCategory === category;

          return (
            <div key={category} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                  <div className="text-left">
                    {isEditingCat ? (
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <input 
                          autoFocus
                          value={editCategoryValue}
                          onChange={e => setEditCategoryValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveCategoryEdit(category)}
                          className="bg-gray-50 border border-gray-200 rounded-md py-0.5 px-1.5 text-xs font-black uppercase tracking-widest outline-none"
                        />
                        <button onClick={() => saveCategoryEdit(category)} className="text-green-600"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingCategory(null)} className="text-rose-600"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group/cat">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">{category}</h3>
                        <button 
                          onClick={(e) => startEditingCategory(e, category)}
                          className="opacity-0 group-hover/cat:opacity-100 p-0.5 text-gray-300 hover:text-indigo-600 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[9px] font-black text-indigo-600 w-6 text-right">{progress}%</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 space-y-0.5 border-t border-gray-50 pt-2">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1 group">
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        {editingItemId === item.id ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input 
                              autoFocus
                              value={editItemValue}
                              onChange={e => setEditItemValue(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && saveItemEdit(item.id)}
                              className="bg-gray-50 border border-gray-200 rounded-md py-0.5 px-1.5 text-xs outline-none w-full"
                            />
                            <button onClick={() => saveItemEdit(item.id)} className="text-green-600"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingItemId(null)} className="text-rose-600"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group/item min-w-0">
                            <span className="text-xs font-medium text-gray-700 truncate">{item.item}</span>
                            <button 
                              onClick={() => startEditingItem(item)}
                              className="opacity-0 group-hover/item:opacity-100 p-0.5 text-gray-300 hover:text-indigo-600 transition-all"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Veda Check */}
                        <button 
                          onClick={() => onUpdateItem(item.id, { checkedV: !item.checkedV })}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all ${item.checkedV ? 'bg-indigo-50 text-indigo-600' : 'text-gray-200 hover:text-gray-300'}`}
                        >
                          <span className="text-[8px] font-black">V</span>
                          {item.checkedV ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                        </button>

                        {/* Murali Check */}
                        <button 
                          onClick={() => onUpdateItem(item.id, { checkedM: !item.checkedM })}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all ${item.checkedM ? 'bg-emerald-50 text-emerald-600' : 'text-gray-200 hover:text-gray-300'}`}
                        >
                          <span className="text-[8px] font-black">M</span>
                          {item.checkedM ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                        </button>

                        <button 
                          onClick={() => onDeleteItem(item.id)}
                          className="p-0.5 text-gray-100 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Quick Add for this category - Compact */}
                  <div className="pt-2 flex gap-1.5">
                    <input 
                      type="text"
                      placeholder={`Add item...`}
                      value={categoryInputs[category] || ''}
                      onChange={(e) => setCategoryInputs(prev => ({ ...prev, [category]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategoryItem(category)}
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-lg py-1 px-3 text-[10px] outline-none"
                    />
                    <button 
                      onClick={() => handleAddCategoryItem(category)}
                      className="bg-indigo-50 text-indigo-600 p-1 rounded-lg active:scale-95 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <Plane className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-sm font-medium text-gray-400">No items in your checklist yet.</p>
        </div>
      )}
    </div>
  );
};

export default TravelTab;
