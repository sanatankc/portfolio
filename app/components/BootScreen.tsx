'use client';

import React, { useState, useEffect } from 'react';
import { FxPlayer } from '../lib/fx';

interface BootLine {
  text: string;
  type: 'header' | 'success' | 'process' | 'warning' | 'error' | 'info' | 'empty' | 'glitch';
  behavior?: 'instant' | 'glitch' | 'typewriter';
  className?: string;
}

interface BootScreenProps {
  onBootComplete: () => void;
  fx?: FxPlayer;
}

// Style mapping for different line types
const getLineStyle = (type: BootLine['type']): string => {
  const styles = {
    header: 'text-cyan-400 font-bold',
    success: 'text-green-300',
    process: 'text-blue-300 ml-2',
    warning: 'text-yellow-400',
    error: 'text-red-400 glitch',
    info: 'text-green-400',
    empty: '',
    glitch: 'text-red-400 glitch'
  };
  return styles[type] || '';
};

// Boot sequence configuration
const BOOT_SEQUENCE: BootLine[] = [
  { text: ":: FoundShell v0.3 ::", type: 'header' },
  { text: ":: Initializing...", type: 'header' },
  { text: "", type: 'empty', behavior: 'instant' },
  { text: "✓ Kernel loaded", type: 'success' },
  { text: "✓ User profile detected: [Sanatan_C]", type: 'success' },
  { text: "✓ Restoring previous session", type: 'success' },
  { text: "", type: 'empty', behavior: 'instant' },
  { text: "> Last login: UNKNOWN", type: 'info' },
  { text: "> Status: OFFLINE", type: 'info' },
  { text: "", type: 'empty', behavior: 'instant' },
  { text: "Recovering windows...", type: 'info' },
  { text: "  ▸ terminal       [OK]", type: 'process' },
  { text: "  ▸ settings       [OK]", type: 'process' },
  { text: "  ▸ chat.app       [OK]", type: 'process' },
  { text: "  ▸ projects/      [partial]", type: 'warning' },
  { text: "  ▸ system.log     [corrupted]", type: 'warning' },
  { text: "", type: 'empty', behavior: 'instant' },
  { text: "████████ ERROR", type: 'error', behavior: 'glitch' },
  { text: "Retrying...", type: 'info' },
  { text: "", type: 'empty', behavior: 'instant' },
  { text: "✓ Recovery complete", type: 'success' },
  { text: "", type: 'empty', behavior: 'instant' },
  { text: "Entering shell...", type: 'info' }
];

const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete, fx }) => {
  // Configuration: Total boot time in milliseconds
  const boot_complete_time = 2500;
  
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineStyles, setCurrentLineStyles] = useState<string[]>([]);
  const [isGlitching, setIsGlitching] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isBootingUp, setIsBootingUp] = useState(false);
  const [bootingUpProgress, setBootingUpProgress] = useState(0);

  // Calculate timing based on boot_complete_time
  const typingPhaseTime = boot_complete_time * 0.8;
  const totalChars = BOOT_SEQUENCE.reduce((sum: number, line: BootLine) => sum + line.text.length, 0);
  const timePerChar = (typingPhaseTime * 0.7) / totalChars;
  const timePerLinePause = (typingPhaseTime * 0.25) / BOOT_SEQUENCE.length;
  const glitchDuration = typingPhaseTime * 0.08;
  const finalDelay = boot_complete_time * 0.02;

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Main boot sequence logic
  useEffect(() => {
    if (isBootingUp) return;

    // Update progress for the typing phase (0-80%)
    setProgress((currentLineIndex / BOOT_SEQUENCE.length) * 80);

    if (currentLineIndex >= BOOT_SEQUENCE.length) {
      // All lines typed, enter booting up phase
      setIsBootingUp(true);
      setDisplayedLines(prev => [...prev, "", "Booting up..."]);
      setCurrentLineStyles(prev => [...prev, "", "text-yellow-300 font-bold animate-pulse"]);
      return;
    }

    const currentBootLine = BOOT_SEQUENCE[currentLineIndex];
    const { text: currentLine, behavior, type } = currentBootLine;
    
    // Handle empty lines or instant behavior
    if (behavior === 'instant' || currentLine === "") {
      setDisplayedLines(prev => [...prev, currentLine]);
      setCurrentLineStyles(prev => [...prev, getLineStyle(type)]);
      setCurrentLineIndex(prev => prev + 1);
      setCurrentCharIndex(0);
      return;
    }

    // Handle glitch behavior
    if (behavior === 'glitch') {
      setIsGlitching(true);
      setTimeout(() => {
        setDisplayedLines(prev => [...prev, currentLine]);
        setCurrentLineStyles(prev => [...prev, getLineStyle(type)]);
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
        setIsGlitching(false);
      }, glitchDuration);
      return;
    }

    // Regular typewriter effect
    if (currentCharIndex < currentLine.length) {
      const typeTimer = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (newLines.length <= currentLineIndex) {
            newLines.push('');
          }
          newLines[currentLineIndex] = currentLine.substring(0, currentCharIndex + 1);
          return newLines;
        });
        
        setCurrentLineStyles(prev => {
          const newStyles = [...prev];
          if (newStyles.length <= currentLineIndex) {
            newStyles.push('');
          }
          newStyles[currentLineIndex] = getLineStyle(type);
          return newStyles;
        });
        
        // Play typewriter sound for visible characters
        const currentChar = currentLine[currentCharIndex];
        if (fx && currentChar && currentChar !== ' ' && Math.random() > 0.3) {
          fx.play('type');
        }
        
        setCurrentCharIndex(prev => prev + 1);
      }, timePerChar + (Math.random() * timePerChar * 0.5));

      return () => clearTimeout(typeTimer);
    } else {
      // Line complete, move to next line after a pause
      const lineCompleteTimer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, timePerLinePause + (Math.random() * timePerLinePause * 0.5));

      return () => clearTimeout(lineCompleteTimer);
    }
  }, [currentLineIndex, currentCharIndex, onBootComplete, finalDelay, fx, glitchDuration, timePerChar, timePerLinePause, isBootingUp]);

  // Handle booting up phase (20% of total boot time)
  useEffect(() => {
    if (!isBootingUp) return;

    const bootingUpDuration = boot_complete_time * 0.3; // 20% of total boot time
    const progressInterval = 100; // Update every 100ms
    const totalSteps = bootingUpDuration / progressInterval;
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      currentStep++;
      const bootProgress = (currentStep / totalSteps) * 20; // 20% of total progress (80-100%)
      setBootingUpProgress(bootProgress);
      setProgress(80 + bootProgress); // Add to the 80% from typing phase

      if (currentStep >= totalSteps) {
        clearInterval(progressTimer);
        
        // Play boot complete sound
        try {
          const audio = new Audio('/fx/click.wav');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore audio errors (user interaction required)
          });
        } catch {
          // Ignore audio errors
        }
        
        // Complete the boot sequence
        setTimeout(() => {
          onBootComplete();
        }, finalDelay);
      }
    }, progressInterval);

    return () => clearInterval(progressTimer);
  }, [isBootingUp, onBootComplete, finalDelay, boot_complete_time]);

  // Random glitch effect
  useEffect(() => {
    if (!isGlitching) return;

    const glitchInterval = setInterval(() => {
      setDisplayedLines(prev => {
        const newLines = [...prev];
        const randomLineIndex = Math.floor(Math.random() * newLines.length);
        const originalLine = newLines[randomLineIndex];
        if (originalLine && originalLine.length > 0) {
          const glitchedLine = originalLine
            .split('')
            .map(char => Math.random() > 0.7 ? '█' : char)
            .join('');
          newLines[randomLineIndex] = glitchedLine;
          
          // Restore original line after brief glitch
          setTimeout(() => {
            setDisplayedLines(current => {
              const restored = [...current];
              restored[randomLineIndex] = originalLine;
              return restored;
            });
          }, 100);
        }
        return newLines;
      });
    }, 150);

    return () => clearInterval(glitchInterval);
  }, [isGlitching]);

  return (
    <div className="fixed inset-0 boot-screen text-green-400 font-mono text-sm overflow-hidden flex flex-col">
      {/* Moving scanline effect */}
      <div className="scanline"></div>
      
      {/* Boot text */}
      <div className="p-8 flex-1 overflow-auto relative z-10 boot-text">
        {displayedLines.map((line, index) => (
          <div 
            key={index} 
            className={`mb-1 ${currentLineStyles[index] || ''} ${isGlitching && Math.random() > 0.8 ? 'flicker' : ''}`}
          >
            {line}
            {((index === currentLineIndex && !isBootingUp) || (isBootingUp && index === displayedLines.length - 1)) && showCursor && (
              <span className="bg-green-400 text-black animate-pulse">_</span>
            )}
          </div>
        ))}
      </div>

      {/* Status indicators */}
      <div className="bottom-4 left-8 text-xs status-pulse relative z-10">
        <div className="text-green-300">
          {isBootingUp ? 'BOOTING_UP_SYSTEM' : 'BOOT_SEQUENCE_ACTIVE'}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>
            {isBootingUp ? 'Finalizing system startup...' : 'System initializing...'}
          </span>
        </div>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-green-600">PROGRESS:</span>
            <div className="w-24 h-1 bg-gray-700 rounded">
              <div 
                className="h-full bg-green-400 rounded transition-all duration-200" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
            <span className="text-green-400">{Math.round(progress)}%</span>
          </div>
          {isBootingUp && (
            <div className="mt-1 text-green-600">
              <span>Boot Phase: {Math.round(bootingUpProgress)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Additional atmospheric elements */}
      <div className="absolute top-4 right-8 text-xs text-green-600 opacity-40 relative z-10">
        <div>BUILD: 20240101.0003</div>
        <div>ARCH: x86_64</div>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span>MEM:</span>
            <div className="w-16 h-1 bg-gray-700 rounded">
              <div className="h-full bg-green-400 rounded animate-pulse" style={{width: '73%'}}></div>
            </div>
            <span>73%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootScreen; 