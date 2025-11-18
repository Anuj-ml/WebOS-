import React, { useState } from 'react';
import { WindowProps } from '../types';
import { RotateCw, ArrowLeft, ArrowRight, Search } from 'lucide-react';

export const Browser: React.FC<WindowProps> = () => {
  const [url, setUrl] = useState('https://www.google.com/webhp?igu=1'); // igu=1 allows basic iframe usage for demo
  const [inputValue, setInputValue] = useState(url);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputValue;
    if (!target.startsWith('http')) {
        target = `https://${target}`;
    }
    setUrl(target);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
        <div className="flex gap-1">
            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><ArrowLeft size={14} /></button>
            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><ArrowRight size={14} /></button>
            <button onClick={() => setUrl(url)} className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><RotateCw size={14} /></button>
        </div>
        <form onSubmit={handleNavigate} className="flex-1 relative">
            <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-400"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </form>
      </div>
      
      {/* Web View */}
      <div className="flex-1 relative bg-white">
        <iframe 
            src={url} 
            className="w-full h-full border-none" 
            title="Browser View"
            sandbox="allow-scripts allow-same-origin allow-forms"
        />
        {/* Overlay because many sites block iframes (X-Frame-Options). This is a visual fallback hint. */}
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-50 text-yellow-800 text-xs p-1 text-center border-t border-yellow-200">
            Note: Many modern websites block embedding in iframes.
        </div>
      </div>
    </div>
  );
};