
import React from 'react';
import { Home, UtensilsCrossed, Calendar, ShoppingCart, Plane, LucideIcon } from 'lucide-react';

interface NavigationProps {
  activeTab: 'home' | 'recipes' | 'mealplan' | 'groceries' | 'travel';
  setActiveTab: (tab: 'home' | 'recipes' | 'mealplan' | 'groceries' | 'travel') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="ios-safe-bottom fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 max-w-2xl mx-auto z-40 px-6">
      <div className="flex justify-around items-center h-20">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')}
          icon={Home}
          label="Home"
        />
        <NavButton 
          active={activeTab === 'recipes'} 
          onClick={() => setActiveTab('recipes')}
          icon={UtensilsCrossed}
          label="Recipes"
        />
        <NavButton 
          active={activeTab === 'mealplan'} 
          onClick={() => setActiveTab('mealplan')}
          icon={Calendar}
          label="Plan"
        />
        <NavButton 
          active={activeTab === 'groceries'} 
          onClick={() => setActiveTab('groceries')}
          icon={ShoppingCart}
          label="Groceries"
        />
        <NavButton 
          active={activeTab === 'travel'} 
          onClick={() => setActiveTab('travel')}
          icon={Plane}
          label="Travel"
        />
      </div>
    </nav>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative group ${active ? 'text-green-700' : 'text-gray-300'}`}
  >
    <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-green-50 scale-110' : 'group-hover:bg-gray-50'}`}>
      <Icon 
        className={`w-6 h-6 transition-all ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} 
      />
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-widest transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>
      {label}
    </span>
    {active && (
      <div className="absolute -top-1 w-1 h-1 bg-green-600 rounded-full" />
    )}
  </button>
);

export default Navigation;
