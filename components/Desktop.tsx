import React from 'react';
import { useOS } from '../context/OSContext';
import { WindowFrame } from './WindowFrame';
import { APPS } from '../constants';
import { DesktopIcon } from './DesktopIcon';
import { AppId } from '../types';
import { StartMenu } from './StartMenu';

export const Desktop: React.FC = () => {
  const { windows, wallpaper, isStartMenuOpen } = useOS();

  return (
    <div 
      className="flex-1 relative bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onContextMenu={(e) => e.preventDefault()} // Disable default context menu
    >
      {/* Desktop Icons */}
      <DesktopIcon appId={AppId.FILE_MANAGER} label="My PC" row={0} col={0} />
      <DesktopIcon appId={AppId.NOTEPAD} label="Notepad" row={1} col={0} />
      <DesktopIcon appId={AppId.BROWSER} label="Browser" row={2} col={0} />
      <DesktopIcon appId={AppId.GEMINI} label="Assistant" row={3} col={0} />
      <DesktopIcon appId={AppId.SETTINGS} label="Settings" row={0} col={1} />

      {/* Active Windows */}
      {windows.map(win => {
        const AppDef = APPS[win.appId];
        const Component = AppDef.component;
        return (
          <WindowFrame key={win.id} window={win}>
            <Component windowId={win.id} data={win.data} />
          </WindowFrame>
        );
      })}

      {/* Start Menu Overlay */}
      {isStartMenuOpen && <StartMenu />}
    </div>
  );
};