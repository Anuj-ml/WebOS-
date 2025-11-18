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
  moveFile: (fileId: string, newParentId: string) => void;
  renameFile: (id: string, newName: string) => void;
  deleteFile: (id: string) => void;
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
      [id]: { 
        ...prev[id], 
        content,
        updatedAt: Date.now()
      }
    }));
  }, []);

  const createFile = useCallback((parentId: string, name: string, type: FileType) => {
    const id = `file-${Date.now()}`;
    const now = Date.now();
    const newNode: FileSystemNode = {
      id,
      parentId,
      name,
      type,
      content: type === FileType.FILE ? '' : undefined,
      children: type === FileType.FOLDER ? [] : undefined,
      createdAt: now,
      updatedAt: now
    };

    setFiles(prev => {
      const parent = prev[parentId];
      return {
        ...prev,
        [id]: newNode,
        [parentId]: {
          ...parent,
          children: [...(parent.children || []), id],
          updatedAt: now
        }
      };
    });
  }, []);

  const moveFile = useCallback((fileId: string, newParentId: string) => {
    setFiles(prev => {
      const file = prev[fileId];
      const oldParentId = file.parentId;
      const newParent = prev[newParentId];

      // Validations
      if (!file || !newParent) return prev; // Invalid IDs
      if (oldParentId === newParentId) return prev; // No change
      if (newParent.type !== FileType.FOLDER) return prev; // Cannot move into a file
      if (fileId === newParentId) return prev; // Cannot move into self

      // Circular dependency check (cannot move folder into its own descendant)
      let currentCheck: string | null = newParentId;
      let isCircular = false;
      while (currentCheck) {
        if (currentCheck === fileId) {
          isCircular = true;
          break;
        }
        currentCheck = prev[currentCheck].parentId;
      }
      if (isCircular) return prev;

      // Perform move
      const nextFiles = { ...prev };
      const now = Date.now();
      
      // 1. Remove from old parent
      if (oldParentId && nextFiles[oldParentId]) {
        nextFiles[oldParentId] = {
          ...nextFiles[oldParentId],
          children: nextFiles[oldParentId].children?.filter(c => c !== fileId) || [],
          updatedAt: now
        };
      }

      // 2. Add to new parent
      nextFiles[newParentId] = {
        ...nextFiles[newParentId],
        children: [...(nextFiles[newParentId].children || []), fileId],
        updatedAt: now
      };

      // 3. Update file parent ref
      nextFiles[fileId] = {
        ...nextFiles[fileId],
        parentId: newParentId,
        updatedAt: now
      };

      return nextFiles;
    });
  }, []);

  const renameFile = useCallback((id: string, newName: string) => {
    if (!newName.trim()) return;
    setFiles(prev => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        name: newName.trim(),
        updatedAt: Date.now() 
      }
    }));
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => {
      // Recursive function to collect all descendant IDs to ensure clean removal
      const idsToDelete = new Set<string>();
      
      const collectIds = (nodeId: string) => {
        idsToDelete.add(nodeId);
        const node = prev[nodeId];
        if (node && node.children) {
          node.children.forEach(collectIds);
        }
      };
      
      // Check if node exists before starting
      if (prev[id]) {
        collectIds(id);
      } else {
        return prev;
      }

      const nextFiles = { ...prev };
      const targetNode = prev[id];

      // Remove from parent's children list
      if (targetNode.parentId && nextFiles[targetNode.parentId]) {
        const parent = nextFiles[targetNode.parentId];
        nextFiles[targetNode.parentId] = {
          ...parent,
          children: parent.children?.filter(childId => childId !== id) || [],
          updatedAt: Date.now()
        };
      }

      // Remove all collected IDs from state
      idsToDelete.forEach(deleteId => {
        delete nextFiles[deleteId];
      });

      return nextFiles;
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
      createFile,
      moveFile,
      renameFile,
      deleteFile
    }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (context === undefined) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};