import React from 'react';
import { WindowProps } from '../types';
import { useOS } from '../context/OSContext';
import { Image, Monitor } from 'lucide-react';

const WALLPAPERS = [
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=1920&q=80", // Mountains
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80", // Space
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1920&q=80", // Alpine
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80", // River
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80", // Abstract
];

export const AppSettings: React.FC<WindowProps> = () => {
  const { setWallpaper, wallpaper } = useOS();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Monitor className="text-blue-600" />
            Personalization
        </h2>
        
        <div className="bg-white p-4 rounded-xl border shadow-sm mb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <Image size={16} />
                Background
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {WALLPAPERS.map((wp, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setWallpaper(wp)}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                            ${wallpaper === wp ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'}
                        `}
                    >
                        <img src={wp} alt={`Wallpaper ${idx}`} className="w-full h-full object-cover" />
                        {wallpaper === wp && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                <div className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">Active</div>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-2">About</h3>
            <p className="text-xs text-gray-500">React WebOS v1.0.0</p>
            <p className="text-xs text-gray-500">Powered by React, Tailwind, and Gemini.</p>
        </div>
      </div>
    </div>
  );
};