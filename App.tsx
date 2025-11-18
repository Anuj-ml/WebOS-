import React from 'react';
import { OSProvider } from './context/OSContext';
import { Desktop } from './components/Desktop';
import { Taskbar } from './components/Taskbar';

const App: React.FC = () => {
  return (
    <OSProvider>
      <div className="h-screen w-screen overflow-hidden flex flex-col relative font-sans text-gray-900">
        {/* Desktop Area */}
        <Desktop />
        
        {/* Taskbar (Sticky at bottom) */}
        <Taskbar />
      </div>
    </OSProvider>
  );
};

export default App;