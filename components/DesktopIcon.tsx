import React from 'react';
import { AppId } from '../types';
import { useOS } from '../context/OSContext';
import { APPS } from '../constants';

interface DesktopIconProps {
  appId: AppId;
  label: string;
  row: number;
  col: number;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ appId, label, row, col }) => {
  const { openWindow } = useOS();
  const AppDef = APPS[appId];
  const Icon = AppDef.icon;

  const handleClick = () => {
    openWindow(appId);
  };

  return (
    <div 
      className="absolute flex flex-col items-center justify-center w-24 h-24 gap-1 cursor-pointer group rounded hover:bg-white/20 transition-colors"
      style={{ 
        top: 16 + row * 104, 
        left: 16 + col * 104 
      }}
      onDoubleClick={handleClick}
    >
      <div className="p-2 rounded-lg shadow-sm bg-white/10 backdrop-blur-sm group-hover:scale-105 transition-transform">
        <Icon size={32} className="text-blue-500 drop-shadow-md" strokeWidth={1.5} />
      </div>
      <span className="text-white text-xs text-center font-medium drop-shadow-md px-2 py-0.5 rounded bg-black/20 group-hover:bg-black/40">
        {label}
      </span>
    </div>
  );
};