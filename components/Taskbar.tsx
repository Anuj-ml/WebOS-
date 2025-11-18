import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';
import { Box, Search, Wifi, Volume2, Battery } from 'lucide-react';

export const Taskbar: React.FC = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow, toggleStartMenu, isStartMenuOpen } = useOS();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-12 bg-white/90 backdrop-blur-md border-t border-white/20 flex items-center justify-between px-4 select-none relative z-[1000]">
      
      {/* Left: Start & Widgets */}
      <div className="flex items-center gap-4">
        {/* Start Button */}
        <button 
          onClick={toggleStartMenu}
          className={`p-2 rounded-md transition-all duration-200 ${isStartMenuOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200/50 hover:scale-105'}`}
        >
          <Box size={24} strokeWidth={1.5} />
        </button>

        {/* Search Placeholder */}
        <div className="hidden sm:flex items-center bg-gray-100/50 rounded-full px-3 py-1.5 border border-gray-200 w-48">
          <Search size={14} className="text-gray-500 mr-2" />
          <span className="text-xs text-gray-400">Search apps...</span>
        </div>
      </div>

      {/* Center: Open Apps */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        {windows.map(win => {
          const App = APPS[win.appId];
          const isActive = activeWindowId === win.id && !win.isMinimized;
          
          return (
            <button
              key={win.id}
              onClick={() => isActive ? minimizeWindow(win.id) : focusWindow(win.id)}
              className={`group relative p-2 rounded-md transition-all duration-200 
                ${isActive ? 'bg-gray-200 shadow-sm' : 'hover:bg-gray-100'}
                ${win.isMinimized ? 'opacity-70' : 'opacity-100'}
              `}
              title={win.title}
            >
              <App.icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-700'} />
              {isActive && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />}
            </button>
          );
        })}
      </div>

      {/* Right: System Tray */}
      <div className="flex items-center gap-4 text-gray-700 text-xs">
        <div className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded cursor-pointer">
          <Wifi size={16} />
          <Volume2 size={16} />
          <Battery size={16} />
        </div>
        <div className="flex flex-col items-end leading-tight hover:bg-gray-100 p-1 rounded px-2 cursor-pointer">
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-[10px] text-gray-500">{time.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};