import React from 'react';
import { LucideIcon } from 'lucide-react';

export enum AppId {
  FILE_MANAGER = 'FILE_MANAGER',
  NOTEPAD = 'NOTEPAD',
  BROWSER = 'BROWSER',
  GEMINI = 'GEMINI',
  SETTINGS = 'SETTINGS',
  TERMINAL = 'TERMINAL'
}

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: LucideIcon;
  component: React.FC<WindowProps>;
  defaultWidth: number;
  defaultHeight: number;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  data?: any; // For passing file content, etc.
}

export interface WindowProps {
  windowId: string;
  data?: any;
}

// Simple File System Types
export enum FileType {
  FILE = 'FILE',
  FOLDER = 'FOLDER'
}

export interface FileSystemNode {
  id: string;
  parentId: string | null;
  name: string;
  type: FileType;
  content?: string; // Only for files
  children?: string[]; // IDs of children (if folder)
  icon?: string;
}

export interface FileSystemState {
  [id: string]: FileSystemNode;
}