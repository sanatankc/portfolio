'use client';

import React, { useState, useRef, useCallback } from 'react';
import Desktop from './components/Desktop';
import BootScreen from './components/BootScreen';
import { DesktopFxPlayer } from './lib/fx';

export default function Home() {
  const [isBooting, setIsBooting] = useState(true);
  const [showDesktop, setShowDesktop] = useState(false);
  const fxPlayerRef = useRef<DesktopFxPlayer | null>(null);

  // Initialize fx player on client side only
  if (typeof window !== 'undefined' && !fxPlayerRef.current) {
    fxPlayerRef.current = new DesktopFxPlayer();
  }

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
    // Small delay for smooth transition
    setTimeout(() => {
      setShowDesktop(true);
    }, 100);
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Boot Screen */}
      {isBooting && (
        <div className={`transition-opacity duration-500 ${isBooting ? 'opacity-100' : 'opacity-0'}`}>
          <BootScreen onBootComplete={handleBootComplete} fx={fxPlayerRef.current || undefined} />
        </div>
      )}
      
      {/* Desktop Interface */}
      {showDesktop && (
        <div className={`transition-opacity duration-1000 ${showDesktop ? 'opacity-100' : 'opacity-0'}`}>
          <Desktop
            initialWindows={[
              // 'terminal',
              // 'chat',
              { appId: 'notes', payload: { path: ['~','whoami.notes'] } }
            ]}
            fx={fxPlayerRef.current || undefined}
          />
        </div>
      )}
    </main>
  );
}
