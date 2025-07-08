import React from 'react';

interface IconProps {
  label: string;
  onDoubleClick: () => void;
  children: React.ReactNode;
}

const Icon: React.FC<IconProps> = ({ label, onDoubleClick, children }) => {
  return (
    <div
      className="flex flex-col items-center gap-1 text-white w-24 text-center"
      onDoubleClick={onDoubleClick}
    >
      {children}
      <span 
        className="font-mono text-sm"
        style={{textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000, 0.5px 0.5px #000, -0.5px -0.5px #000, 0.5px -0.5px #000, -0.5px 0.5px #000'}}
      >
        {label}
      </span>
    </div>
  );
};

export default Icon; 