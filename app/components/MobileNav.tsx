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
      <button className="p-2 text-white flex items-center justify-center" onClick={() => {
        navigator.vibrate(50);
        if (areAllWindowsHidden) {
          showAllWindows();
        } else {
          hideAllWindows();
        }
      }}>
        <div className="text-[28px] w-[30px] h-[30px] flex items-center justify-center">
          {areAllWindowsHidden ? <i className="hn hn-grid"></i> : <i className="hn hn-home"></i> }
        </div>
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
