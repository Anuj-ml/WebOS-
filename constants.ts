import React from 'react';
import { AppId, AppDefinition, FileSystemState, FileType } from './types';
import { Folder, FileText, Globe, Sparkles, Settings, Terminal } from 'lucide-react';
import { Notepad } from './apps/Notepad';
import { FileManager } from './apps/FileManager';
import { Browser } from './apps/Browser';
import { GeminiChat } from './apps/GeminiChat';
import { AppSettings } from './apps/AppSettings';

export const APPS: Record<AppId, AppDefinition> = {
  [AppId.FILE_MANAGER]: {
    id: AppId.FILE_MANAGER,
    name: 'File Explorer',
    icon: Folder,
    component: FileManager,
    defaultWidth: 800,
    defaultHeight: 500,
  },
  [AppId.NOTEPAD]: {
    id: AppId.NOTEPAD,
    name: 'Notepad',
    icon: FileText,
    component: Notepad,
    defaultWidth: 600,
    defaultHeight: 400,
  },
  [AppId.BROWSER]: {
    id: AppId.BROWSER,
    name: 'Web Browser',
    icon: Globe,
    component: Browser,
    defaultWidth: 900,
    defaultHeight: 600,
  },
  [AppId.GEMINI]: {
    id: AppId.GEMINI,
    name: 'Gemini Assistant',
    icon: Sparkles,
    component: GeminiChat,
    defaultWidth: 400,
    defaultHeight: 600,
  },
  [AppId.SETTINGS]: {
    id: AppId.SETTINGS,
    name: 'Settings',
    icon: Settings,
    component: AppSettings,
    defaultWidth: 500,
    defaultHeight: 400,
  },
  [AppId.TERMINAL]: { // Placeholder
    id: AppId.TERMINAL,
    name: 'Terminal',
    icon: Terminal,
    component: () => React.createElement('div', { className: "bg-black text-green-500 p-4 h-full font-mono" }, "user@webos:~$ _"),
    defaultWidth: 600,
    defaultHeight: 400,
  }
};

export const INITIAL_FILES: FileSystemState = {
  'root': { id: 'root', parentId: null, name: 'C:', type: FileType.FOLDER, children: ['documents', 'desktop_folder'] },
  'documents': { id: 'documents', parentId: 'root', name: 'Documents', type: FileType.FOLDER, children: ['readme'] },
  'desktop_folder': { id: 'desktop_folder', parentId: 'root', name: 'Desktop', type: FileType.FOLDER, children: ['welcome'] },
  'readme': { 
    id: 'readme', 
    parentId: 'documents', 
    name: 'readme.txt', 
    type: FileType.FILE, 
    content: 'Welcome to React WebOS!\n\nThis is a fully functional simulation built with React and TypeScript.\nTry opening the Gemini Assistant to chat with AI.' 
  },
  'welcome': {
    id: 'welcome',
    parentId: 'desktop_folder',
    name: 'Hello.txt',
    type: FileType.FILE,
    content: 'Hello World! You can edit this file.'
  }
};

export const DESKTOP_WALLPAPER = "https://picsum.photos/1920/1080?blur=2";