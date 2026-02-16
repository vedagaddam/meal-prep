
import React, { useState, useEffect } from 'react';
import { Home, Leaf, Wind, Sun, Settings, Info } from 'lucide-react';
import Welcome from './components/Welcome';
import Navigation from './components/Navigation';
import ThemeToggle from './components/ThemeToggle';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'settings'>('home');
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Check if app is running in standalone mode (installed)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);
  }, []);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white/30 backdrop-blur-sm shadow-xl relative overflow-hidden">
      {/* Top Decoration */}
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-green-200/40 rounded-full blur-3xl -z-10" />
      <div className="absolute top-20 right-[-30px] w-32 h-32 bg-yellow-100/40 rounded-full blur-2xl -z-10" />

      {/* Header */}
      <header className="ios-safe-top pt-8 px-6 pb-4 flex justify-between items-center bg-white/20 backdrop-blur-md sticky top-0 z-10 border-b border-green-100/50">
        <div>
          <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            Haven
          </h1>
          <p className="text-xs text-green-600 font-medium">Your Daily Sanctuary</p>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-24">
        {activeTab === 'home' && (
          <Welcome isIOS={isIOS} isStandalone={isStandalone} />
        )}
        
        {activeTab === 'discover' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-green-900 mb-4">Discover Nature</h2>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-2 shadow-sm border border-green-50/50">
                  <img 
                    src={`https://picsum.photos/300/300?random=nature_${i}`} 
                    className="rounded-xl w-full aspect-square object-cover mb-2"
                    alt="Nature preview"
                  />
                  <p className="text-sm font-medium text-green-800 px-1">Peaceful Spot #{i}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-green-900 mb-4">Settings</h2>
            <ul className="space-y-3">
              <li className="bg-white/50 p-4 rounded-xl flex justify-between items-center">
                <span className="text-green-800">Notifications</span>
                <div className="w-10 h-6 bg-green-200 rounded-full relative">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </li>
              <li className="bg-white/50 p-4 rounded-xl flex justify-between items-center">
                <span className="text-green-800">Sound Effects</span>
                <div className="w-10 h-6 bg-green-500 rounded-full relative">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </li>
              <li className="bg-white/50 p-4 rounded-xl flex items-center gap-3 text-red-500">
                 <Info className="w-5 h-5" />
                 <span>About Nature Haven</span>
              </li>
            </ul>
          </div>
        )}
      </main>

      {/* Persistent Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Bottom Decoration */}
      <div className="absolute bottom-[-20px] right-[-20px] w-40 h-40 bg-green-100/40 rounded-full blur-3xl -z-10" />
    </div>
  );
};

export default App;
