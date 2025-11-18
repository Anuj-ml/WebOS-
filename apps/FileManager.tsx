import React, { useState, useEffect, useRef } from 'react';
import { WindowProps, FileType, AppId, FileSystemNode } from '../types';
import { useOS } from '../context/OSContext';
import { 
  Folder, FileText, ChevronRight, ArrowLeft, HardDrive, Search, X, PanelRight, Info,
  FileCode, FileJson, Image as ImageIcon, Music, Video, File as FileIcon, Trash2
} from 'lucide-react';

export const FileManager: React.FC<WindowProps> = () => {
  const { files, openWindow, moveFile, renameFile, deleteFile } = useOS();
  const [currentPath, setCurrentPath] = useState<string>('root');
  const [history, setHistory] = useState<string[]>([]);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Renaming State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const currentFolder = files[currentPath];
  const selectedFile = selectedFileId ? files[selectedFileId] : null;
  
  const handleNavigate = (id: string) => {
    if (files[id].type === FileType.FOLDER) {
      setHistory(prev => [...prev, currentPath]);
      setCurrentPath(id);
      setSearchQuery(''); // Clear search on navigation
      setSelectedFileId(null); // Clear selection on navigation
    } else {
      // Open file
      openWindow(AppId.NOTEPAD, { fileId: id });
    }
  };

  const handleBack = () => {
    if (searchQuery) {
      setSearchQuery('');
      return;
    }

    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCurrentPath(prev);
      setSelectedFileId(null);
    } else if (currentFolder && currentFolder.parentId) {
      setCurrentPath(currentFolder.parentId);
      setSelectedFileId(null);
    }
  };

  // Renaming Handlers
  const startRenaming = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameFile(renamingId, renameValue);
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitRename();
    } else if (e.key === 'Escape') {
      cancelRename();
    }
  };

  // Deleting Handlers
  const handleDeleteClick = () => {
    if (selectedFileId && !renamingId) {
        setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (selectedFileId) {
        deleteFile(selectedFileId);
        setSelectedFileId(null);
        setShowDeleteConfirm(false);
    }
  };

  // Global key handler for delete shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' && selectedFileId && !renamingId && !showDeleteConfirm) {
            setShowDeleteConfirm(true);
        }
    };
    
    // Only add listener if this window has focus (simplified check: assume always active for this demo)
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFileId, renamingId, showDeleteConfirm]);


  // Focus input when renaming starts
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('fileId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault(); // Necessary to allow dropping
    
    // Only highlight folders, and don't highlight self
    if (files[id] && files[id].type === FileType.FOLDER) {
       setDragOverId(id);
       e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    const fileId = e.dataTransfer.getData('fileId');
    
    if (fileId && files[targetId] && files[targetId].type === FileType.FOLDER && fileId !== targetId) {
        moveFile(fileId, targetId);
    }
  };

  // Helper to get icon based on file type/extension
  const getFileIconInfo = (name: string, type: FileType) => {
    if (type === FileType.FOLDER) {
        return { icon: Folder, color: 'text-yellow-400' };
    }

    const ext = name.split('.').pop()?.toLowerCase();
    switch(ext) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
        case 'html':
        case 'css':
            return { icon: FileCode, color: 'text-purple-500' };
        case 'json':
            return { icon: FileJson, color: 'text-orange-500' };
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
            return { icon: ImageIcon, color: 'text-green-500' };
        case 'mp3':
        case 'wav':
            return { icon: Music, color: 'text-pink-500' };
        case 'mp4':
        case 'mov':
            return { icon: Video, color: 'text-pink-500' };
        case 'txt':
        case 'md':
            return { icon: FileText, color: 'text-gray-500' };
        default:
            return { icon: FileIcon, color: 'text-gray-400' };
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  const DroppableSidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => {
    const isOver = dragOverId === id;
    return (
      <button 
        onClick={() => { setCurrentPath(id); setSearchQuery(''); setSelectedFileId(null); }} 
        onDragOver={(e) => handleDragOver(e, id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, id)}
        className={`w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2 transition-colors
            ${isOver ? 'bg-blue-100 ring-2 ring-blue-300 z-10' : 'hover:bg-blue-50 text-gray-700'}
            ${currentPath === id && !searchQuery ? 'bg-blue-100 text-blue-700 font-medium' : ''}
        `}
      >
         <Icon size={14} /> {label}
      </button>
    );
  };

  // Filter files for display
  const displayItems: FileSystemNode[] = searchQuery 
    ? Object.values(files).filter((f: FileSystemNode) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) && f.id !== 'root')
    : (currentFolder?.children?.map((id: string) => files[id]).filter((f): f is FileSystemNode => !!f) || []);

  const SelectedIconInfo = selectedFile ? getFileIconInfo(selectedFile.name, selectedFile.type) : null;
  const SelectedIcon = SelectedIconInfo ? SelectedIconInfo.icon : null;

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-white rounded-lg shadow-2xl p-4 w-80 border border-gray-200 animate-in zoom-in-95 duration-200">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Delete Item?</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to delete "{selectedFile?.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded shadow-sm transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-white">
        <button 
          onClick={handleBack}
          disabled={!currentFolder?.parentId && history.length === 0 && !searchQuery}
          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 text-gray-600"
        >
          <ArrowLeft size={16} />
        </button>
        
        {/* Breadcrumb / Address Bar */}
        <div 
            className="flex-1 bg-gray-100 px-3 py-1 rounded text-sm text-gray-600 border border-gray-200 flex items-center gap-1 overflow-hidden"
            onDragOver={(e) => !searchQuery && currentFolder?.parentId && handleDragOver(e, currentFolder.parentId)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => !searchQuery && currentFolder?.parentId && handleDrop(e, currentFolder.parentId)}
        >
           <HardDrive size={12} className="flex-shrink-0" />
           <span className="text-gray-400 flex-shrink-0">/</span>
           <span className="truncate">{searchQuery ? `Search results for "${searchQuery}"` : currentFolder?.name || 'Unknown'}</span>
        </div>

        {/* Search Bar */}
        <div className="relative w-48 group hidden sm:block">
            <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-8 pr-7 py-1 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
            {searchQuery && (
                <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X size={12} />
                </button>
            )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Delete Button */}
        <button
            onClick={handleDeleteClick}
            disabled={!selectedFileId}
            className={`p-1.5 rounded transition-colors ${!selectedFileId ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-50 text-gray-600 hover:text-red-600'}`}
            title="Delete Selected"
        >
            <Trash2 size={16} />
        </button>

        {/* Toggle Preview */}
        <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`p-1.5 rounded transition-colors ${showPreview ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
            title="Toggle Preview Pane"
        >
            <PanelRight size={16} />
        </button>
      </div>

      {/* Main View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-40 border-r bg-white p-2 hidden sm:block space-y-1 flex-shrink-0">
          <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Favorites</div>
          <DroppableSidebarItem id="root" icon={HardDrive} label="This PC" />
          <DroppableSidebarItem id="documents" icon={Folder} label="Documents" />
        </div>

        {/* Content Grid */}
        <div 
            className="flex-1 p-4 overflow-y-auto bg-white"
            onDragOver={(e) => !searchQuery && e.preventDefault()} 
            onClick={() => { setSelectedFileId(null); commitRename(); }}
        >
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayItems.map(file => {
              if (!file) return null;
              const isOver = dragOverId === file.id;
              const isSelected = selectedFileId === file.id;
              const isRenaming = renamingId === file.id;
              const { icon: ItemIcon, color: iconColor } = getFileIconInfo(file.name, file.type);
              
              return (
                <div
                  key={file.id}
                  draggable={!isRenaming}
                  onDragStart={(e) => handleDragStart(e, file.id)}
                  onDragOver={(e) => handleDragOver(e, file.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, file.id)}
                  onClick={(e) => { e.stopPropagation(); setSelectedFileId(file.id); if (isRenaming) return; commitRename(); }}
                  onDoubleClick={() => { if (!isRenaming) handleNavigate(file.id); }}
                  className={`
                    flex flex-col items-center gap-2 p-2 rounded group cursor-pointer border relative
                    ${isOver ? 'bg-blue-100 border-blue-300 scale-105 shadow-sm' : ''}
                    ${isSelected && !isOver && !isRenaming ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : ''}
                    ${!isSelected && !isOver ? 'border-transparent hover:bg-gray-50' : ''}
                    transition-all
                  `}
                >
                  <ItemIcon 
                    className={`w-12 h-12 drop-shadow-sm transition-colors ${isOver ? 'text-blue-500' : iconColor}`} 
                    fill={file.type === FileType.FOLDER ? "currentColor" : "none"} 
                    strokeWidth={1.5}
                  />
                  
                  <div className="flex flex-col items-center w-full h-9 justify-start">
                      {isRenaming ? (
                         <input
                           ref={renameInputRef}
                           type="text"
                           value={renameValue}
                           onChange={(e) => setRenameValue(e.target.value)}
                           onBlur={commitRename}
                           onKeyDown={handleRenameKeyDown}
                           onClick={(e) => e.stopPropagation()}
                           className="w-full text-xs text-center border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                         />
                      ) : (
                        <span 
                          className={`text-xs text-center break-all line-clamp-2 select-none font-medium 
                                      ${isSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-700'}`}
                          onDoubleClick={(e) => {
                             e.stopPropagation();
                             startRenaming(file.id, file.name);
                          }}
                        >
                            {file.name}
                        </span>
                      )}
                      
                      {searchQuery && file.parentId && !isRenaming && (
                          <span className="text-[10px] text-gray-400 truncate w-full text-center">
                              in {files[file.parentId]?.name || 'Unknown'}
                          </span>
                      )}
                  </div>
                </div>
              );
            })}
            
            {displayItems.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center text-gray-300 mt-10">
                 <div className="p-4 bg-gray-50 rounded-full mb-2">
                    {searchQuery ? <Search size={32} className="opacity-20" /> : <Folder size={32} className="opacity-20" />}
                 </div>
                 <span className="text-sm">{searchQuery ? `No results for "${searchQuery}"` : 'Folder is empty'}</span>
               </div>
            )}
          </div>
        </div>

        {/* Preview Pane */}
        {showPreview && (
          <div className="w-64 border-l bg-gray-50 flex flex-col animate-in slide-in-from-right-5 duration-300 shadow-xl z-20">
             {selectedFile && SelectedIcon ? (
                 <>
                    <div className="p-6 flex flex-col items-center border-b bg-white">
                        <SelectedIcon 
                            className={`w-20 h-20 mb-4 drop-shadow-sm ${SelectedIconInfo?.color}`} 
                            fill={selectedFile.type === FileType.FOLDER ? "currentColor" : "none"} 
                            strokeWidth={1.5}
                        />
                        
                        {/* Rename in Preview Pane */}
                        {renamingId === selectedFile.id ? (
                            <input
                                ref={renameInputRef} // Re-use ref works because only one input renders at a time usually
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={commitRename}
                                onKeyDown={handleRenameKeyDown}
                                className="w-full text-sm font-semibold text-gray-800 text-center border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        ) : (
                            <h3 
                                className="text-sm font-semibold text-gray-800 text-center break-all cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    startRenaming(selectedFile.id, selectedFile.name);
                                }}
                                title="Double click to rename"
                            >
                                {selectedFile.name}
                            </h3>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Information Group */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Information</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Type</span>
                                    <span className="text-gray-800 font-medium">
                                        {selectedFile.type === FileType.FOLDER ? 'File Folder' : `${selectedFile.name.split('.').pop()?.toUpperCase()} File`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Location</span>
                                    <span className="text-gray-800 truncate max-w-[120px] text-right" title={selectedFile.parentId || 'Root'}>
                                        {selectedFile.parentId ? files[selectedFile.parentId]?.name : 'Root'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Created</span>
                                    <span className="text-gray-800 text-right">{formatDate(selectedFile.createdAt)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Modified</span>
                                    <span className="text-gray-800 text-right">{formatDate(selectedFile.updatedAt)}</span>
                                </div>

                                {selectedFile.type === FileType.FILE && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Size</span>
                                        <span className="text-gray-800">{selectedFile.content?.length || 0} bytes</span>
                                    </div>
                                )}
                                {selectedFile.type === FileType.FOLDER && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Contains</span>
                                        <span className="text-gray-800">{selectedFile.children?.length || 0} items</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Preview */}
                        {selectedFile.type === FileType.FILE && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preview</h4>
                                <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto shadow-sm">
                                    {selectedFile.content?.slice(0, 500) || <span className="italic text-gray-400">Empty file</span>}
                                    {selectedFile.content && selectedFile.content.length > 500 && (
                                        <span className="text-blue-500 block mt-2">... (more)</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                 </>
             ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                     <Info size={48} className="mb-4 opacity-20" />
                     <p className="text-sm">Select a file to see details and preview content.</p>
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};