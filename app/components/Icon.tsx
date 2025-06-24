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
      <span>{label}</span>
    </div>
  );
};

export default Icon; 