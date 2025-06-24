import Terminal from '@/app/components/Terminal';
import React from 'react';
import Settings from '@/app/components/Settings';
import TerminalIcon from '@/app/components/TerminalIcon';
import SettingsIcon from '@/app/components/SettingsIcon';

export interface App {
  id: string;
  name: string;
  component: React.FC<any>;
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
];

export const getApps = () => apps;

export const getApp = (id: string) => apps.find(app => app.id === id); 