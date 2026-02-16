
import React from 'react';
import { Home, Compass, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: 'home' | 'discover' | 'settings';
  setActiveTab: (tab: 'home' | 'discover' | 'settings') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="ios-safe-bottom fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-green-100/50 max-w-md mx-auto z-20">
      <div className="flex justify-around items-center h-16 px-4">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'text-green-700 scale-110' : 'text-green-300'}`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-green-700' : ''}`} />
          <span className="text-[10px] font-bold">HOME</span>
        </button>

        <button 
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'discover' ? 'text-green-700 scale-110' : 'text-green-300'}`}
        >
          <Compass className={`w-6 h-6 ${activeTab === 'discover' ? 'fill-green-700' : ''}`} />
          <span className="text-[10px] font-bold">DISCOVER</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'settings' ? 'text-green-700 scale-110' : 'text-green-300'}`}
        >
          <Settings className={`w-6 h-6 ${activeTab === 'settings' ? 'fill-green-700' : ''}`} />
          <span className="text-[10px] font-bold">SETTINGS</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
