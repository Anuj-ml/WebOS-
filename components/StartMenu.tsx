import React from 'react';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';
import { AppId } from '../types';
import { Power } from 'lucide-react';

export const StartMenu: React.FC = () => {
  const { openWindow, toggleStartMenu } = useOS();

  const handleAppClick = (appId: AppId) => {
    openWindow(appId);
    toggleStartMenu(); // Close menu after clicking
  };

  return (
    <div className="absolute bottom-14 left-4 w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 p-4 flex flex-col gap-4 z-[2000] animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search for apps, settings, and documents" 
          className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      <div className="flex-1">
        <h3 className="text-xs font-semibold text-gray-500 mb-2 px-1">Pinned</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.values(APPS).map((app) => (
            <button
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                <app.icon size={20} className="text-gray-700" />
              </div>
              <span className="text-[10px] text-gray-600 text-center leading-tight truncate w-full">{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <span className="text-sm font-medium text-gray-700">User</span>
        </div>
        <button className="p-2 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-full transition-colors">
          <Power size={18} />
        </button>
      </div>
    </div>
  );
};