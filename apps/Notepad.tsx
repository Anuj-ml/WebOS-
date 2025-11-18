import React, { useState, useEffect } from 'react';
import { WindowProps } from '../types';
import { useOS } from '../context/OSContext';
import { Save } from 'lucide-react';

export const Notepad: React.FC<WindowProps> = ({ windowId, data }) => {
  const { updateFileContent, files } = useOS();
  const fileId = data?.fileId;
  
  // Generate a storage key. If it's an untitled file, we use a generic draft key.
  // Note: This implies all 'Untitled' windows share the same draft storage in this simple implementation.
  const STORAGE_KEY = `webos_notepad_autosave_${fileId || 'untitled'}`;

  // Initialize content:
  // 1. If it's a system file (fileId exists), load from OS file system.
  // 2. If it's untitled, try to recover the last auto-saved draft from localStorage.
  const [content, setContent] = useState(() => {
    if (fileId) {
      return files[fileId]?.content || '';
    }
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  const [status, setStatus] = useState('Ready');
  const [isDirty, setIsDirty] = useState(false);

  // Auto-save Effect
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, content);
      setStatus('Auto-saved (Local)');
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [content, isDirty, STORAGE_KEY]);

  const handleSave = () => {
    if (fileId) {
      updateFileContent(fileId, content);
      setStatus('Saved to System');
      // Sync local backup
      localStorage.setItem(STORAGE_KEY, content);
    } else {
      // For untitled, this just confirms the local save visually
      localStorage.setItem(STORAGE_KEY, content);
      setStatus('Saved to Local Storage');
    }
    // We keep isDirty true if we want continuous auto-save updates, 
    // or we could reset it. Leaving it allows the auto-save debounce to continue naturally.
    setTimeout(() => setStatus('Ready'), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
    setStatus('Editing...');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-1 border-b px-2 py-1 text-xs bg-gray-50 select-none">
        <button 
            onClick={handleSave} 
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 px-2 py-1 rounded shadow-sm transition-all mr-2 text-gray-700 active:scale-95"
            title={fileId ? "Save to File System" : "Save to Local Storage"}
        >
            <Save size={13} />
            <span>Save</span>
        </button>
        
        <div className="w-px h-4 bg-gray-300 mx-1" />
        
        <button className="hover:bg-gray-200 px-2 py-1 rounded text-gray-600">File</button>
        <button className="hover:bg-gray-200 px-2 py-1 rounded text-gray-600">Edit</button>
        <button className="hover:bg-gray-200 px-2 py-1 rounded text-gray-600">View</button>
        <span className="ml-auto text-gray-400 italic max-w-[150px] truncate">
          {fileId ? files[fileId]?.name : 'Untitled (Draft)'}
        </span>
      </div>
      <textarea
        className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm text-gray-800 leading-relaxed"
        value={content}
        onChange={handleChange}
        placeholder="Type here..."
        spellCheck={false}
      />
      <div className="border-t px-3 py-1 text-[10px] text-gray-500 flex justify-between bg-gray-50">
        <span className={status.includes('Saved') ? 'text-green-600 font-medium' : ''}>{status}</span>
        <div className="flex gap-3">
            <span>{fileId ? 'System File' : 'Local Draft'}</span>
            <span>Ln {content.split('\n').length}, Col {content.length}</span>
        </div>
      </div>
    </div>
  );
};
