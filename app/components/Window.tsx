'use client';

import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Theme, defaultWindowThemes } from '../lib/themes';
import { useDesktopSettings } from '../lib/store';

interface WindowProps {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  initialTheme?: Theme;
  onClose: () => void;
  onFocus: () => void;
  onDragStop: (x: number, y: number) => void;
  onResizeStop: (width: number, height: number, x: number, y: number) => void;
  children: React.ReactElement;
}

const Window: React.FC<WindowProps> = ({
  title,
  x,
  y,
  width,
  height,
  zIndex,
  initialTheme,
  onClose,
  onFocus,
  onDragStop,
  onResizeStop,
  children,
}) => {
  const { mode } = useDesktopSettings();
  const [theme, setTheme] = useState(initialTheme);

  // If the app provides a theme, always use it for the window. Otherwise, use global mode theme.
  let windowTheme: { background: string; foreground: string; closeButton: string; border: string };
  if (theme && theme.window && theme.window.background && theme.window.foreground && theme.window.closeButton) {
    const t = theme.window as { background: string; foreground: string; closeButton: string; border?: string };
    windowTheme = {
      background: t.background,
      foreground: t.foreground,
      closeButton: t.closeButton,
      border: t.border || defaultWindowThemes[mode].border,
    };
  } else {
    windowTheme = defaultWindowThemes[mode];
  }

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      onDragStop={(e, d) => onDragStop(d.x, d.y)}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResizeStop(
          parseInt(ref.style.width),
          parseInt(ref.style.height),
          position.x,
          position.y
        );
      }}
      onDragStart={onFocus}
      onResizeStart={onFocus}
      style={{ zIndex, borderColor: windowTheme.border }}
      bounds="parent"
      dragHandleClassName="window-title-bar"
      className="border-2"
    >
      <div className="w-full h-full flex flex-col" style={{background: windowTheme.background}}>
        <div className="h-6 border-b-2 flex items-center justify-between px-2 flex-shrink-0 window-title-bar cursor-move"
             style={{borderColor: windowTheme.border, color: windowTheme.foreground}}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-4 h-4 border-2"
            style={{borderColor: windowTheme.foreground, backgroundColor: windowTheme.closeButton}}
          ></button>
          <span className="font-mono">{title}</span>
          <div className="w-4 h-4"></div>
        </div>
        <div className="flex-grow overflow-hidden">
          {React.cloneElement(children as React.ReactElement<{ onThemeChange?: (theme: Theme) => void }>, { onThemeChange: setTheme })}
        </div>
      </div>
    </Rnd>
  );
};

export default Window; 