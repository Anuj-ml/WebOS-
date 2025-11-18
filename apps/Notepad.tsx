import React, { useState, useEffect } from 'react';
import { WindowProps } from '../types';
import { useOS } from '../context/OSContext';

export const Notepad: React.FC<WindowProps> = ({ windowId, data }) => {
  const { updateFileContent, files } = useOS();
  // data might contain { fileId: string } if opened from File Explorer
  const fileId = data?.fileId;
  
  const initialContent = fileId ? files[fileId]?.content || '' : '';
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState('Ready');

  const handleSave = () => {
    if (fileId) {
      updateFileContent(fileId, content);
      setStatus('Saved');
      setTimeout(() => setStatus('Ready'), 2000);
    } else {
      setStatus('Cannot save (No file linked)');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 border-b px-2 py-1 text-xs bg-gray-50">
        <button onClick={handleSave} className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700">File</button>
        <button className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700">Edit</button>
        <button className="hover:bg-gray-200 px-2 py-0.5 rounded text-gray-700">View</button>
        <span className="ml-auto text-gray-400 italic">{fileId ? files[fileId]?.name : 'Untitled'}</span>
      </div>
      <textarea
        className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm text-gray-800"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type here..."
        spellCheck={false}
      />
      <div className="border-t px-3 py-1 text-[10px] text-gray-500 flex justify-between bg-gray-50">
        <span>{status}</span>
        <span>Ln {content.split('\n').length}, Col {content.length}</span>
      </div>
    </div>
  );
};