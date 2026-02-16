
import React from 'react';
import { Share, PlusSquare, ArrowDown, ExternalLink } from 'lucide-react';

interface WelcomeProps {
  isIOS: boolean;
  isStandalone: boolean;
}

const Welcome: React.FC<WelcomeProps> = ({ isIOS, isStandalone }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center space-y-4">
        <div className="relative inline-block">
          <img 
            src="https://picsum.photos/400/400?random=hero" 
            alt="Nature hero" 
            className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
          />
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-md">
            <span className="text-lg">🌿</span>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-green-900">Welcome to My App</h2>
          <p className="text-green-700 mt-2 max-w-xs mx-auto">
            A serene space designed to bring a touch of nature to your digital life.
          </p>
        </div>
      </section>

      {/* Call to Action for PWA Installation on iOS */}
      {isIOS && !isStandalone && (
        <section className="bg-green-600 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <PlusSquare className="w-6 h-6" />
              Install as App
            </h3>
            <p className="text-green-50 text-sm mb-4">
              Get the best experience by adding this to your home screen!
            </p>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-center gap-3 bg-white/20 p-3 rounded-2xl">
                <span className="bg-white text-green-700 w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
                <p>Tap the <Share className="w-4 h-4 inline-block mx-1" /> "Share" button below</p>
              </div>
              <div className="flex items-center gap-3 bg-white/20 p-3 rounded-2xl">
                <span className="bg-white text-green-700 w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                <p>Scroll down and tap <strong className="underline">"Add to Home Screen"</strong></p>
              </div>
            </div>
            <div className="mt-4 flex justify-center animate-bounce">
              <ArrowDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
        </section>
      )}

      {isStandalone && (
        <section className="bg-white/80 border border-green-100 p-6 rounded-3xl text-center">
          <span className="inline-block p-3 bg-green-100 rounded-full mb-3">
             <ExternalLink className="text-green-600 w-6 h-6" />
          </span>
          <h3 className="text-lg font-bold text-green-900">Successfully Installed</h3>
          <p className="text-green-700 text-sm mt-1">Enjoy Haven right from your home screen!</p>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-green-50 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-2xl text-2xl">🍃</div>
          <div>
            <h4 className="font-bold text-green-900">Breathe Easy</h4>
            <p className="text-sm text-green-600">Simple design for peace of mind.</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-green-50 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-2xl text-2xl">💧</div>
          <div>
            <h4 className="font-bold text-green-900">Natural Themes</h4>
            <p className="text-sm text-green-600">Organic colors and fluid layouts.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
