import React, { useState } from 'react';
import { WindowProps, FileType, AppId } from '../types';
import { useOS } from '../context/OSContext';
import { Folder, FileText, ChevronRight, ArrowLeft, HardDrive } from 'lucide-react';

export const FileManager: React.FC<WindowProps> = () => {
  const { files, openWindow } = useOS();
  const [currentPath, setCurrentPath] = useState<string>('root');
  const [history, setHistory] = useState<string[]>([]);

  const currentFolder = files[currentPath];
  
  const handleNavigate = (id: string) => {
    if (files[id].type === FileType.FOLDER) {
      setHistory(prev => [...prev, currentPath]);
      setCurrentPath(id);
    } else {
      // Open file
      openWindow(AppId.NOTEPAD, { fileId: id });
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentPath(prev);
    } else if (currentFolder.parentId) {
      setCurrentPath(currentFolder.parentId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-white">
        <button 
          onClick={handleBack}
          disabled={!currentFolder.parentId && history.length === 0}
          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 bg-gray-100 px-3 py-1 rounded text-sm text-gray-600 border border-gray-200 flex items-center gap-1">
           <HardDrive size={12} />
           <span className="text-gray-400">/</span>
           <span>{currentFolder.name}</span>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-40 border-r bg-white p-2 hidden sm:block">
          <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Favorites</div>
          <button onClick={() => setCurrentPath('root')} className="w-full text-left px-2 py-1 rounded hover:bg-blue-50 text-sm text-gray-700 flex items-center gap-2">
             <HardDrive size={14} /> This PC
          </button>
          <button onClick={() => setCurrentPath('documents')} className="w-full text-left px-2 py-1 rounded hover:bg-blue-50 text-sm text-gray-700 flex items-center gap-2">
             <Folder size={14} /> Documents
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {currentFolder.children?.map(childId => {
              const file = files[childId];
              return (
                <button
                  key={childId}
                  onDoubleClick={() => handleNavigate(childId)}
                  className="flex flex-col items-center gap-2 p-2 hover:bg-blue-50 rounded group"
                >
                  {file.type === FileType.FOLDER ? (
                    <Folder className="text-yellow-400 w-12 h-12 drop-shadow-sm" fill="currentColor" />
                  ) : (
                    <FileText className="text-gray-400 w-10 h-10" />
                  )}
                  <span className="text-xs text-center text-gray-700 group-hover:text-blue-700 break-all line-clamp-2">
                    {file.name}
                  </span>
                </button>
              );
            })}
            {(!currentFolder.children || currentFolder.children.length === 0) && (
               <div className="col-span-full text-center text-gray-400 text-sm mt-10">
                 Folder is empty
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};