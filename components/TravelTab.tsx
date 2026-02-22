
import React, { useState, useMemo } from 'react';
import { Plane, CheckCircle2, Circle, Plus, Trash2, User, Filter, Search, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
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

  const getCategoryProgress = (catItems: TravelChecklistItem[]) => {
    const total = catItems.length * 2; // 2 people
    const checked = catItems.reduce((acc, item) => acc + (item.checkedV ? 1 : 0) + (item.checkedM ? 1 : 0), 0);
    return total === 0 ? 0 : Math.round((checked / total) * 100);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Travel Checklist</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Veda & Murali's Essentials</p>
        </div>
        <Plane className="w-8 h-8 text-indigo-600 opacity-20" />
      </header>

      {/* Search & Toggle All */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search items or categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <button 
          onClick={toggleAll}
          className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm text-gray-400 hover:text-indigo-600 transition-colors active:scale-95"
          title={expandedCategories.size === categories.length ? "Collapse All" : "Expand All"}
        >
          {expandedCategories.size === categories.length ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-5 space-y-3">
        <div className="flex gap-2">
          <input 
            list="categories"
            placeholder="Category" 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 bg-white border border-indigo-100 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <datalist id="categories">
            {categories.map(cat => <option key={cat} value={cat} />)}
          </datalist>
          <input 
            placeholder="Item name" 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-[2] bg-white border border-indigo-100 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl shadow-md active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Checklist Groups */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, catItems]) => {
          const isExpanded = expandedCategories.has(category) || searchQuery.length > 0;
          const progress = getCategoryProgress(catItems);

          return (
            <div key={category} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <div className="text-left">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{category}</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{catItems.length} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 w-8 text-right">{progress}%</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-2 border-t border-gray-50 pt-4">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 group">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700">{item.item}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Veda Check */}
                        <button 
                          onClick={() => onUpdateItem(item.id, { checkedV: !item.checkedV })}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${item.checkedV ? 'bg-indigo-50 text-indigo-600' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                          <span className="text-[9px] font-black">V</span>
                          {item.checkedV ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </button>

                        {/* Murali Check */}
                        <button 
                          onClick={() => onUpdateItem(item.id, { checkedM: !item.checkedM })}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${item.checkedM ? 'bg-emerald-50 text-emerald-600' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                          <span className="text-[9px] font-black">M</span>
                          {item.checkedM ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </button>

                        <button 
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-gray-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Quick Add for this category */}
                  <div className="pt-4 flex gap-2">
                    <input 
                      type="text"
                      placeholder={`Add to ${category}...`}
                      value={categoryInputs[category] || ''}
                      onChange={(e) => setCategoryInputs(prev => ({ ...prev, [category]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategoryItem(category)}
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-2 px-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button 
                      onClick={() => handleAddCategoryItem(category)}
                      className="bg-indigo-50 text-indigo-600 p-2 rounded-xl active:scale-95 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
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
