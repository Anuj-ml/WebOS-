import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WindowState, AppId, FileSystemState, FileSystemNode, FileType } from '../types';
import { INITIAL_FILES, APPS } from '../constants';

interface OSContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  files: FileSystemState;
  wallpaper: string;
  isStartMenuOpen: boolean;
  
  // Window Actions
  openWindow: (appId: AppId, data?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  
  // System Actions
  toggleStartMenu: () => void;
  setWallpaper: (url: string) => void;
  
  // File System Actions
  updateFileContent: (id: string, content: string) => void;
  createFile: (parentId: string, name: string, type: FileType) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileSystemState>(INITIAL_FILES);
  const [wallpaper, setWallpaperState] = useState<string>("https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=1920&q=80");
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [highestZ, setHighestZ] = useState(100);

  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, zIndex: highestZ + 1, isMinimized: false };
      }
      return w;
    }));
    setHighestZ(prev => prev + 1);
    setIsStartMenuOpen(false);
  }, [highestZ]);

  const openWindow = useCallback((appId: AppId, data?: any) => {
    // Check if app allows multiple instances or focus existing (simplified: multiple allowed)
    const id = `${appId}-${Date.now()}`;
    const appDef = APPS[appId];
    
    // Center window
    const startX = Math.max(0, (window.innerWidth - appDef.defaultWidth) / 2) + (windows.length * 20);
    const startY = Math.max(0, (window.innerHeight - appDef.defaultHeight) / 2) + (windows.length * 20);

    const newWindow: WindowState = {
      id,
      appId,
      title: appDef.name,
      x: startX,
      y: startY,
      width: appDef.defaultWidth,
      height: appDef.defaultHeight,
      isMinimized: false,
      isMaximized: false,
      zIndex: highestZ + 1,
      data
    };

    setWindows(prev => [...prev, newWindow]);
    setHighestZ(prev => prev + 1);
    setActiveWindowId(id);
    setIsStartMenuOpen(false);
  }, [windows.length, highestZ]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  }, [activeWindowId]);

  const toggleMaximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  }, [focusWindow]);

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  }, []);

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  }, []);

  const toggleStartMenu = useCallback(() => {
    setIsStartMenuOpen(prev => !prev);
  }, []);

  const setWallpaper = useCallback((url: string) => {
    setWallpaperState(url);
  }, []);

  // File System Logic
  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [id]: { ...prev[id], content }
    }));
  }, []);

  const createFile = useCallback((parentId: string, name: string, type: FileType) => {
    const id = `file-${Date.now()}`;
    const newNode: FileSystemNode = {
      id,
      parentId,
      name,
      type,
      content: type === FileType.FILE ? '' : undefined,
      children: type === FileType.FOLDER ? [] : undefined
    };

    setFiles(prev => {
      const parent = prev[parentId];
      return {
        ...prev,
        [id]: newNode,
        [parentId]: {
          ...parent,
          children: [...(parent.children || []), id]
        }
      };
    });
  }, []);

  return (
    <OSContext.Provider value={{
      windows,
      activeWindowId,
      files,
      wallpaper,
      isStartMenuOpen,
      openWindow,
      closeWindow,
      minimizeWindow,
      toggleMaximizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      toggleStartMenu,
      setWallpaper,
      updateFileContent,
      createFile
    }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) throw new Error('useOS must be used within OSProvider');
  return context;
};