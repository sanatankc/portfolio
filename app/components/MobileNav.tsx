'use client';

import React from 'react';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const OverviewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect width="14" height="14" x="5" y="5" rx="2" />
  </svg>
);


const MobileNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[calc(60px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-black/30 backdrop-blur-lg flex justify-around items-center z-[100000]">
      <button className="p-2 text-white">
        <BackIcon />
      </button>
      <button className="p-2 text-white">
        <HomeIcon />
      </button>
      <button className="p-2 text-white">
        <OverviewIcon />
      </button>
    </div>
  );
};

export default MobileNav;