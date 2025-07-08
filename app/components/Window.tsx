'use client';

import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { defaultWindowThemes } from '../lib/themes';
import { useDesktopSettings } from '../lib/store';

interface WindowProps {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
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
  onClose,
  onFocus,
  onDragStop,
  onResizeStop,
  children,
}) => {
  const { mode } = useDesktopSettings();
  const [theme, setTheme] = useState(defaultWindowThemes[mode]);

  useEffect(() => {
    setTheme(defaultWindowThemes[mode]);
  }, [mode]);

  const windowTheme = theme;

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
      className="border-pixel-lg border-2"
    >
      <div className="w-full h-full flex flex-col" style={{background: windowTheme.background}}>
        <div className="h-8 border-b-2 flex items-center justify-between px-2 flex-shrink-0 window-title-bar cursor-move"
             style={{borderColor: windowTheme.border, color: windowTheme.foreground}}
        >
          <div className='flex flex-col py-1 h-full justify-around w-[15px] mr-2'>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-[20px] h-[20px] border-1 border-pixel-xs flex items-center justify-center"
              style={{borderColor: windowTheme.foreground, backgroundColor: windowTheme.closeButton, color: windowTheme.closeButtonText}}
          >
            <i className="hn hn-times-solid text-xs"></i>
          </button>
          <div className='flex flex-col py-1 h-full justify-around flex-1 ml-2'>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
          </div>
          <div className="w-4 h-4"></div>
          <span className="font-mono">{title}</span>
          <div className="w-4 h-4"></div>
          <div className='flex flex-col py-1 h-full justify-around flex-1'>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
          {React.cloneElement(children as React.ReactElement<{ onThemeChange?: (theme: { background: string; foreground: string; closeButton: string; border: string }) => void }>, { onThemeChange: setTheme })}
        </div>
      </div>
    </Rnd>
  );
};

export default Window; 