import React from 'react';
// FIX: Replace undefined 'CachedResult' with the 'Session' type, which is defined and fits the component's needs.
import type { Session } from '../types';

interface HistoryAreaProps {
  // FIX: Use the 'Session' type for the items prop.
  items: Session[];
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
            // FIX: Use the unique 'item.id' for the key instead of 'item.topic', which may not be unique.
            key={item.id}
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
