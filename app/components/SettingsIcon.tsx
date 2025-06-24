import React from 'react';
import { FiSettings } from 'react-icons/fi';

const SettingsIcon: React.FC = () => (
  <div className="w-16 h-16 bg-gray-200 border-2 border-white flex items-center justify-center">
    <FiSettings className="text-3xl text-gray-700" />
  </div>
);

export default SettingsIcon; 