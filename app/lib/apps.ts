import Terminal from '@/app/components/Terminal';
import React from 'react';
import Settings from '@/app/components/Settings';
import Chat from '@/app/components/Chat';
import TerminalIcon from '@/app/components/TerminalIcon';
import SettingsIcon from '@/app/components/SettingsIcon';
import ChatIcon from '@/app/components/ChatIcon';

export interface App {
  id: string;
  name: string;
  component: React.FC;
  icon: React.FC;
}

const apps: App[] = [
  {
    id: 'terminal',
    name: 'Terminal',
    component: Terminal,
    icon: TerminalIcon,
  },
  {
    id: 'settings',
    name: 'Settings',
    component: Settings,
    icon: SettingsIcon,
  },
  {
    id: 'chat',
    name: 'Chat',
    component: Chat,
    icon: ChatIcon,
  },
];

export const getApps = () => apps;

export const getApp = (id: string) => apps.find(app => app.id === id); 