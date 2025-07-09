import Terminal from '@/app/components/Terminal';
import React from 'react';
import Settings from '@/app/components/Settings';
import Chat from '@/app/components/Chat';
import TerminalIcon from '@/app/components/TerminalIcon';
import SettingsIcon from '@/app/components/SettingsIcon';
import ChatIcon from '@/app/components/ChatIcon';
import { FxPlayer } from './fx';

export interface AppProps {
  fx: FxPlayer;
  onThemeChange?: (theme: { background: string; foreground: string; closeButton: string; closeButtonText?: string; border: string }) => void;
}

export interface App {
  id: string;
  name: string;
  component: React.FC<AppProps>;
  icon: React.FC;
}

const apps: App[] = [
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
  {
    id: 'chat',
    name: 'Chat',
    component: Chat as React.FC<AppProps>,
    icon: ChatIcon,
  },
];

export const getApps = () => apps;

export const getApp = (id: string) => apps.find(app => app.id === id); 