"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Window from './Window'; // Assuming Window can be adapted for this view
import { getApp } from '../lib/apps';

// Define the types for the props we're receiving from Desktop.tsx
interface WindowState {
  id: number;
  appId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  payload?: unknown;
  opacity?: number;
  theme?: any; // Replace 'any' with a more specific theme type if available
  titleOverride?: string;
  backdropBlurPx?: number;
}

interface AppSwitcherViewProps {
  windows: WindowState[];
  getApp: (appId: string) => any; // Replace 'any' with a more specific app type
  bringToFront: (id: number) => void;
  toggleAppSwitcher: () => void;
}

const AppSwitcherView: React.FC<AppSwitcherViewProps> = ({
  windows,
  getApp,
  bringToFront,
  toggleAppSwitcher,
}) => {
  const handleWindowClick = (id: number) => {
    bringToFront(id);
    toggleAppSwitcher();
  };

  const focusedWindowId = windows.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), windows[0])?.id;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-lg z-[1000] flex flex-col items-center justify-start pt-20 space-y-4 overflow-y-auto"
        onClick={toggleAppSwitcher} // Close switcher when clicking the background
      >
        {windows.map((win, index) => {
          const app = getApp(win.appId);
          if (!app) return null;
          const AppComponent = app.component;

          return (
            <motion.div
              key={win.id}
              layoutId={`window-${win.id}`}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`w-[300px] h-[200px] relative ${win.id === focusedWindowId ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleWindowClick(win.id);
              }}
            >
              <div className="absolute inset-0 pointer-events-none">
                <Window
                  key={win.id}
                  title={win.titleOverride ?? app.name}
                  x={0}
                  y={0}
                  width={300}
                  height={200}
                  zIndex={1}
                  onClose={() => {}}
                  onFocus={() => {}}
                  onDragStop={() => {}}
                  onResizeStop={() => {}}
                  isSwitcherMode={true}
                >
                  <AppComponent
                    payload={win.payload}
                    openApp={() => {}}
                    closeSelf={() => {}}
                    setWindowTitle={() => {}}
                  />
                </Window>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};

export default AppSwitcherView;
