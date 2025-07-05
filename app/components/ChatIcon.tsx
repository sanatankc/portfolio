import React from 'react';
import { BsChatDots } from 'react-icons/bs';

const ChatIcon: React.FC = () => {
  return (
    <div className="w-16 h-16 bg-blue-600 border-2 border-blue-400 flex items-center justify-center rounded-lg hover:bg-blue-700 transition-colors">
      <BsChatDots className="w-8 h-8 text-white" />
    </div>
  );
};

export default ChatIcon; 