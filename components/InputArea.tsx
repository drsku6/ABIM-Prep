import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface InputAreaProps {
  topic: string;
  setTopic: (topic: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ topic, setTopic, onGenerate, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && topic.trim()) {
      onGenerate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex items-center bg-white rounded-full shadow-md">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter an ABIM topic or clinical condition (e.g., Dizziness, AKI, Hyponatremia)..."
          className="w-full px-6 py-4 text-lg bg-transparent rounded-full focus:outline-none text-brand-text font-serif"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="m-2 px-6 py-3 bg-brand-blue text-white rounded-full font-sans font-semibold flex items-center justify-center transition-colors duration-200 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="h-5 w-5 mr-2" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate
            </>
          )}
        </button>
      </div>
    </form>
  );
};
