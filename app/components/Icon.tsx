import React from 'react';

interface IconProps {
  label: string;
  onDoubleClick: () => void;
  children: React.ReactNode;
}

const Icon: React.FC<IconProps> = ({ label, onDoubleClick, children }) => {
  return (
    <div
      className="flex flex-col items-center gap-2 text-white w-24 text-center select-none"
      onDoubleClick={onDoubleClick}
    >
      <div className="transition-transform duration-150 hover:scale-105">
        {children}
      </div>
      <span 
        className="font-mono text-[13px] leading-tight"
        style={{textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 0.5px 0.5px #000, -0.5px -0.5px #000, 0.5px -0.5px #000, -0.5px 0.5px #000'}}
      >
        {label}
      </span>
    </div>
  );
};

export default Icon; 