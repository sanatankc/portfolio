'use client';

import React from 'react';
import { useDesktopSettings } from '../lib/store';

const OverviewIcon = () => (
  <div className="w-[22px] h-[22px] border-[2.5px] border-white pixel-corners-xs">
  </div>
);


const MobileNav: React.FC = () => {
  const { toggleAppSwitcher, hideAllWindows, showAllWindows, areAllWindowsHidden } = useDesktopSettings();
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[calc(60px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-black/70 flex justify-around items-center z-[100000]">
      <button className="p-2 text-white" onClick={() => {
        navigator.vibrate(50);
        if (areAllWindowsHidden) {
          showAllWindows();
        } else {
          hideAllWindows();
        }
      }}>
        {areAllWindowsHidden ? <i className="hn hn-grid text-3xl"></i> : <i className="hn hn-home text-3xl"></i> }
      </button>
      <button className="p-2 text-white" onClick={() => {
        navigator.vibrate(50);
        toggleAppSwitcher();
      }}>
        <OverviewIcon />
      </button>
    </div>
  );
};

export default MobileNav;
