import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AILogoIcon } from './icons/AILogoIcon';
import { SendIcon } from './icons/SendIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { marked } from 'marked';

interface FollowUpAreaProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const FollowUpArea: React.FC<FollowUpAreaProps> = ({ history, onSendMessage, isLoading }) => {
  const [question, setQuestion] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSendMessage(question);
      setQuestion('');
    }
  };
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);
  
  const processMessageContent = (content: string) => {
    return marked.parse(content, { gfm: true, breaks: true });
  };

  return (
    <div className="w-full max-w-4xl mt-8 bg-white rounded-xl shadow-lg">
        <div className="p-6 sm:p-8 border-b border-gray-200">
            <h2 className="text-xl font-sans font-bold text-brand-teal">Follow-up Questions</h2>
            <p className="text-gray-600 mt-1 font-sans text-sm">Ask a question about the generated algorithm.</p>
        </div>

        <div className="p-6 sm:p-8 max-h-[50vh] overflow-y-auto">
            <div className="space-y-6">
                {history.map((message, index) => (
                    <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'model' && (
                             <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-teal text-white flex items-center justify-center">
                                <AILogoIcon className="h-5 w-5" />
                            </div>
                        )}
                        <div className={`rounded-lg p-4 max-w-xl prose prose-sm prose-p:my-2 prose-ul:my-2 prose-ol:my-2 font-serif ${message.role === 'user' ? 'bg-blue-100 text-brand-text' : 'bg-gray-100 text-brand-text'}`}>
                           {
                             !message.html && isLoading && index === history.length -1 ? (
                                <SpinnerIcon className="h-5 w-5 text-brand-teal" />
                             ) : (
                                <div dangerouslySetInnerHTML={{ __html: processMessageContent(message.html) as string }} />
                             )
                           }
                        </div>
                         {message.role === 'user' && (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                                <UserIcon className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
             <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What are the '5 D's' of central vertigo?"
                    className="w-full px-4 py-2 text-md bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue font-serif"
                    disabled={isLoading}
                    aria-label="Ask a follow-up question"
                />
                <button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                    className="p-3 bg-brand-blue text-white rounded-lg font-sans font-semibold flex items-center justify-center transition-colors duration-200 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    aria-label="Send message"
                >
                    {isLoading ? <SpinnerIcon className="h-5 w-5"/> : <SendIcon className="h-5 w-5" />}
                </button>
            </form>
        </div>
    </div>
  );
};
