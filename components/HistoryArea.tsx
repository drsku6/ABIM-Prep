import React from 'react';
import type { CachedResult } from '../types';

interface HistoryAreaProps {
  items: CachedResult[];
  onSelect: (topic: string) => void;
}

export const HistoryArea: React.FC<HistoryAreaProps> = ({ items, onSelect }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mt-4 px-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-sans font-medium text-gray-500">Recent:</span>
        {items.map(item => (
          <button
            key={item.topic}
            onClick={() => onSelect(item.topic)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-sans hover:bg-gray-200 transition-colors border border-gray-200"
            aria-label={`Load topic: ${item.topic}`}
          >
            {item.topic}
          </button>
        ))}
      </div>
    </div>
  );
};
