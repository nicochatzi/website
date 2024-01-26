import React, { useState, ReactNode } from 'react';

interface ExpandingSectionProps {
  title: string;
  children: ReactNode;
}

const ExpandingSection: React.FC<ExpandingSectionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-left w-full text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
      >
        {title}
      </button>
      <div
        className={`absolute right-0 top-0 w-72 transition-all overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
      >
        <div className="border-l border-gray-300 p-4 bg-white dark:bg-gray-800 shadow-lg">
          {isOpen && children}
        </div>
      </div>
    </div>
  );
};

export default ExpandingSection;

