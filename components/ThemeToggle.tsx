
import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  return (
    <button 
      onClick={() => setIsDark(!isDark)}
      className="p-2.5 rounded-2xl bg-white/40 border border-white/50 shadow-inner flex items-center justify-center transition-all active:scale-90"
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-indigo-600 animate-in zoom-in spin-in-90 duration-300" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500 animate-in zoom-in spin-in-180 duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
