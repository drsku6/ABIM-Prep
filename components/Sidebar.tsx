import React from 'react';
import type { Session } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { MessageIcon } from './icons/MessageIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PanelLeftCloseIcon } from './icons/PanelLeftCloseIcon';

interface SidebarProps {
  width: number;
  sessions: Session[];
  activeSessionId: string | null;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  sessions,
  activeSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onClose,
}) => {
  return (
    <aside
      className="bg-gray-50 border-r border-gray-200 flex flex-col h-screen flex-shrink-0"
      style={{ width: `${width}px` }}
    >
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <button
          onClick={onNewSession}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-sans font-semibold text-white bg-brand-blue rounded-lg hover:bg-blue-800 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Case
        </button>
        <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close sidebar"
        >
            <PanelLeftCloseIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {sessions.map((session) => (
            <a
              key={session.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectSession(session.id);
              }}
              className={`group flex items-center justify-between p-3 text-sm font-sans rounded-md transition-colors ${
                activeSessionId === session.id
                  ? 'bg-blue-100 text-brand-blue font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                 <MessageIcon className="w-5 h-5 flex-shrink-0" />
                 <span className="truncate">{session.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity ml-2 flex-shrink-0"
                aria-label={`Delete session: ${session.title}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};