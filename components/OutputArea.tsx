import React, { useState, useCallback, useEffect } from 'react';
import type { TabType, Content } from '../types';
import { AlgorithmIcon } from './icons/AlgorithmIcon';
import { VignetteIcon } from './icons/VignetteIcon';
import { CopyIcon } from './icons/CopyIcon';

interface OutputAreaProps {
  algorithm: Content | null;
  vignettes: Content | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAlgorithmLoading: boolean;
  isVignettesLoading: boolean;
  onGenerateVignettes: () => void;
  error: string | null;
}

const SkeletonLoader: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </div>
    <div className="h-24 bg-gray-200 rounded w-full"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

export const OutputArea: React.FC<OutputAreaProps> = ({
  algorithm,
  vignettes,
  activeTab,
  setActiveTab,
  isAlgorithmLoading,
  isVignettesLoading,
  onGenerateVignettes,
  error,
}) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  
  // Reset copy button text if the content changes
  useEffect(() => {
    setCopyButtonText('Copy');
  }, [algorithm, vignettes, activeTab]);

  const handleCopy = useCallback(() => {
    const contentHtml = activeTab === 'algorithm' ? algorithm?.html : vignettes?.html;
    if (contentHtml) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentHtml;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      try {
        const htmlBlob = new Blob([contentHtml], { type: 'text/html' });
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        });

        navigator.clipboard.write([clipboardItem]).then(() => {
          setCopyButtonText('Copied!');
          setTimeout(() => setCopyButtonText('Copy'), 2000);
        }).catch(() => {
            throw new Error('Rich text copy failed');
        });
      } catch (err) {
        navigator.clipboard.writeText(plainText).then(() => {
          setCopyButtonText('Copied!');
          setTimeout(() => setCopyButtonText('Copy'), 2000);
        }).catch(copyErr => {
          console.error('Fallback plain text copy failed: ', copyErr);
          setCopyButtonText('Failed');
          setTimeout(() => setCopyButtonText('Copy'), 2000);
        });
      }
    }
  }, [activeTab, algorithm, vignettes]);
  
  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'vignettes') {
      onGenerateVignettes();
    }
  }

  // Do not render the output area until the first generation is initiated
  if (!algorithm && !isAlgorithmLoading && !error) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mt-8">
       {error && (
        <div className=" bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
        </div>
        )}
      
      <div className="bg-white rounded-xl shadow-lg relative">
        <div className="absolute top-4 right-6 z-10">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm font-sans font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200 flex items-center shadow-sm border border-gray-200 disabled:opacity-50"
            aria-label="Copy content"
            disabled={
                (activeTab === 'algorithm' && (!algorithm?.html || isAlgorithmLoading)) ||
                (activeTab === 'vignettes' && (!vignettes?.html || isVignettesLoading))
            }
          >
            <CopyIcon className="h-4 w-4 mr-2" />
            {copyButtonText}
          </button>
        </div>
        
        <div className="border-b border-gray-200 px-6 sm:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => handleTabClick('algorithm')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-sans font-semibold text-md flex items-center ${
                activeTab === 'algorithm'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlgorithmIcon className="h-5 w-5 mr-2" />
              Master Algorithm
            </button>
            <button
              onClick={() => handleTabClick('vignettes')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-sans font-semibold text-md flex items-center ${
                activeTab === 'vignettes'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <VignetteIcon className="h-5 w-5 mr-2" />
              Vignette Bank
            </button>
          </nav>
        </div>

        <div className="p-6 sm:p-8 min-h-[300px]">
          {activeTab === 'algorithm' && (
            <div>
                {algorithm && <div dangerouslySetInnerHTML={{ __html: algorithm.html }} />}
                {isAlgorithmLoading && !algorithm?.html && <SkeletonLoader />}
            </div>
          )}
          {activeTab === 'vignettes' && (
             <div>
                {isVignettesLoading && <SkeletonLoader />}
                {!isVignettesLoading && vignettes && <div dangerouslySetInnerHTML={{ __html: vignettes.html }} />}
                {!isVignettesLoading && !vignettes && !error && (
                    <div className="text-center text-gray-500 pt-10">
                        <p>Vignettes will be generated for the topic above.</p>
                    </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};