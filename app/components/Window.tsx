'use client';

import React from 'react';
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
  // Optional per-window background opacity override (1 = opaque)
  opacity?: number;
  // Optional explicit theme to use for this window
  theme?: typeof defaultWindowThemes.dark;
  // Optional backdrop blur (in pixels) applied to the window surfaces
  backdropBlurPx?: number;
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
  opacity,
  theme: themeProp,
  backdropBlurPx,
}) => {
  const { mode, windowOpacity } = useDesktopSettings();
  const windowTheme = themeProp ?? defaultWindowThemes[mode];
  const effectiveOpacity = typeof opacity === 'number' ? opacity : windowOpacity;

  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const bigint = parseInt(normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

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
      className="border-pixel-sm-[#c0c0c0]"
    >
      <div className={`w-full h-full flex flex-col`}>
        <div
          className="h-7 border-b-1 flex items-center justify-between px-2 flex-shrink-0 window-title-bar cursor-move"
          style={{
            backgroundColor: hexToRgba(windowTheme.background, Math.min(1, Math.max(0, effectiveOpacity))),
            borderColor: windowTheme.border,
            color: windowTheme.foreground,
            backdropFilter: backdropBlurPx ? `blur(${backdropBlurPx}px)` : undefined,
            WebkitBackdropFilter: backdropBlurPx ? `blur(${backdropBlurPx}px)` : undefined,
          }}
        >
          <div className='flex flex-col py-1 h-full justify-around w-[15px] mr-1'>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
            <div className='border-t w-full' style={{ borderColor: windowTheme.foreground }}></div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-[20px] h-[20px] border-pixel-xs-black flex items-center justify-center"
              style={{borderColor: windowTheme.foreground, backgroundColor: windowTheme.closeButton, color: windowTheme.closeButtonText}}
          >
            <i className="hn hn-times-solid text-xs"></i>
          </button>
          <div className='flex flex-col py-1 h-full justify-around flex-1 ml-1'>
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
        <div
          className={`flex-grow overflow-scroll`}
          style={{
            background: hexToRgba(windowTheme.background, Math.min(1, Math.max(0, effectiveOpacity))),
            backdropFilter: backdropBlurPx ? `blur(${backdropBlurPx}px)` : undefined,
            WebkitBackdropFilter: backdropBlurPx ? `blur(${backdropBlurPx}px)` : undefined,
          }}
          onMouseDown={onFocus}
        >
          {children}
        </div>
      </div>
    </Rnd>
  );
};

export default Window; 