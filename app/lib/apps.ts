import Terminal from '@/app/components/Terminal';
import React from 'react';
import Settings from '@/app/components/Settings';
import TerminalIcon from '@/app/components/TerminalIcon';
import SettingsIcon from '@/app/components/SettingsIcon';
// import Chat from '@/app/components/Chat';
// import ChatIcon from '@/app/components/ChatIcon';
import { FxPlayer } from './fx';
import FileBrowser from '../components/FileBrowser';
import Notes from '../components/Notes';
import Browser from '../components/Browser';
import FileBrowserIcon from '../components/FileBrowserIcon';
import NotesIcon from '../components/NotesIcon';
import BrowserIcon from '../components/BrowserIcon';
import { defaultWindowThemes } from './themes';

export interface AppProps {
  fx: FxPlayer;
  // Provided by Desktop so apps can open other apps or spawn new windows
  openApp: (appId: string, payload?: unknown) => number | void;
  // Allow apps to set their window title dynamically
  setWindowTitle?: (title: string) => void;
  // Allow an app window to close itself
  closeSelf?: () => void;
  // Optional per-window data
  payload?: unknown;
  // Optional: allow app to request a window theme change (used by Chat/tool UIs)
  onThemeChange?: (theme: typeof defaultWindowThemes.dark) => void;
}

export interface App {
  id: string;
  name: string;
  component: React.FC<AppProps>;
  icon: React.FC;
  // Optional default window sizing (ratios of viewport)
  defaultWindow?: {
    widthRatio?: number; // 0..1
    heightRatio?: number; // 0..1
    // Optional default background opacity for this app's window (1 = opaque)
    opacity?: number;
    backdropBlurPx?: number;
    // Optional explicit window theme override per app
    theme?: typeof defaultWindowThemes.dark;
  };
}

const apps: App[] = [
  // {
  //   id: 'chat',
  //   name: 'Chat',
  //   component: Chat as React.FC<AppProps>,
  //   icon: ChatIcon,
  // },
  {
    id: 'file-browser',
    name: 'Files',
    component: FileBrowser as React.FC<AppProps>,
    icon: FileBrowserIcon,
    defaultWindow: { widthRatio: 0.5, heightRatio: 0.5, opacity: 1 },
  },
  {
    id: 'notes',
    name: 'Notes',
    component: Notes as React.FC<AppProps>,
    icon: NotesIcon,
    defaultWindow: { widthRatio: 0.5, heightRatio: 0.5, opacity: 0.9, backdropBlurPx: 10 },
  },
  {
    id: 'browser',
    name: 'Browser',
    component: Browser as React.FC<AppProps>,
    icon: BrowserIcon,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    component: Terminal as React.FC<AppProps>,
    icon: TerminalIcon,
  },
  {
    id: 'settings',
    name: 'Settings',
    component: Settings as React.FC<AppProps>,
    icon: SettingsIcon,
  },
];

export const getApps = () => apps;

export const getApp = (id: string) => apps.find(app => app.id === id); 