import React, { useState, useCallback, useEffect } from 'react';
import { InputArea } from './components/InputArea';
import { OutputArea } from './components/OutputArea';
import { FollowUpArea } from './components/FollowUpArea';
import { HistoryArea } from './components/HistoryArea';
import { startChatAndGenerateAlgorithm, generateVignettes, sendFollowUpMessageStream } from './services/geminiService';
import type { Content, TabType, ChatMessage, CachedResult } from './types';
import type { Chat } from '@google/genai';

const MAX_HISTORY_ITEMS = 7;
const HISTORY_STORAGE_KEY = 'abimBoardMasterHistory';


const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [algorithm, setAlgorithm] = useState<Content | null>(null);
  const [vignettes, setVignettes] = useState<Content | null>(null);

  const [isAlgorithmLoading, setIsAlgorithmLoading] = useState<boolean>(false);
  const [isVignettesLoading, setIsVignettesLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<TabType>('algorithm');

  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState<boolean>(false);

  const [history, setHistory] = useState<CachedResult[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  const handleSelectHistoryTopic = useCallback((topicToLoad: string) => {
    const cachedItem = history.find(item => item.topic.toLowerCase() === topicToLoad.toLowerCase());
    if (cachedItem) {
      setError(null);
      setVignettes(null);
      setChatSession(null);
      setChatHistory([]);
      setIsAlgorithmLoading(false);
      setActiveTab('algorithm');
      
      setTopic(cachedItem.topic);
      setAlgorithm(cachedItem.algorithm);

      setHistory(prev => {
        const newHistory = prev.filter(h => h.topic.toLowerCase() !== topicToLoad.toLowerCase());
        newHistory.unshift(cachedItem);
        return newHistory;
      });
    }
  }, [history]);

  const handleGenerateAlgorithm = useCallback(async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;

    const existingItem = history.find(item => item.topic.toLowerCase() === trimmedTopic.toLowerCase());
    if (existingItem) {
      handleSelectHistoryTopic(existingItem.topic);
      return;
    }

    setIsAlgorithmLoading(true);
    setError(null);
    setAlgorithm({ html: '' }); // Reset and initialize for streaming
    setVignettes(null); // Clear previous vignettes
    setActiveTab('algorithm');
    setChatSession(null);
    setChatHistory([]);

    let finalAlgorithmHtml = '';
    try {
      const chat = await startChatAndGenerateAlgorithm(trimmedTopic, (chunk) => {
        finalAlgorithmHtml += chunk;
        setAlgorithm(prev => ({ html: (prev?.html || '') + chunk }));
      });
      setChatSession(chat);

      const newHistoryItem: CachedResult = { topic: trimmedTopic, algorithm: { html: finalAlgorithmHtml } };
      setHistory(prev => {
          const newHistory = prev.filter(h => h.topic.toLowerCase() !== newHistoryItem.topic.toLowerCase());
          newHistory.unshift(newHistoryItem);
          return newHistory.slice(0, MAX_HISTORY_ITEMS);
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during algorithm generation.');
      }
      setAlgorithm(null);
      setChatSession(null);
    } finally {
      setIsAlgorithmLoading(false);
    }
  }, [topic, history, handleSelectHistoryTopic]);

  const handleGenerateVignettes = useCallback(async () => {
    if (vignettes || isVignettesLoading || !topic) return;

    setIsVignettesLoading(true);
    setError(null);

    try {
      const result = await generateVignettes(topic);
      setVignettes(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during vignette generation.');
      }
    } finally {
      setIsVignettesLoading(false);
    }
  }, [topic, vignettes, isVignettesLoading]);

  const handleRefreshVignettes = useCallback(async () => {
    if (isVignettesLoading || !topic) return;

    setIsVignettesLoading(true);
    setError(null);
    setVignettes(null); 

    try {
      const result = await generateVignettes(topic);
      setVignettes(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during vignette generation.');
      }
      setVignettes(null);
    } finally {
      setIsVignettesLoading(false);
    }
  }, [topic, isVignettesLoading]);

  const handleSendFollowUp = useCallback(async (message: string) => {
    if (!chatSession || !message.trim()) return;

    setIsFollowUpLoading(true);
    setError(null);
    
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', html: message }];
    newHistory.push({ role: 'model', html: '' });
    setChatHistory(newHistory);

    try {
      await sendFollowUpMessageStream(chatSession, message, (chunk) => {
        setChatHistory(prev => {
          const updatedHistory = [...prev];
          const lastMessage = updatedHistory[updatedHistory.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.html += chunk;
          }
          return updatedHistory;
        });
      });
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
       setChatHistory(prev => {
          const updatedHistory = [...prev];
          const lastMessage = updatedHistory[updatedHistory.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.html = `<p class="text-red-600"><strong>Error:</strong> ${errorMessage}</p>`;
          }
          return updatedHistory;
       });
    } finally {
      setIsFollowUpLoading(false);
    }
  }, [chatSession, chatHistory]);


  return (
    <main className="bg-brand-background text-brand-text font-serif min-h-screen flex flex-col items-center p-4 sm:p-8">
      <header className="text-center my-8 sm:my-12">
        <h1 className="font-sans text-4xl sm:text-5xl font-bold text-brand-blue">
          ABIM Board Master
        </h1>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl">
          Your AI-powered study agent for mastering high-yield ABIM topics.
        </p>
      </header>

      <InputArea
        topic={topic}
        setTopic={setTopic}
        onGenerate={handleGenerateAlgorithm}
        isLoading={isAlgorithmLoading}
      />
      
      <HistoryArea items={history} onSelect={handleSelectHistoryTopic} />

      <OutputArea
        algorithm={algorithm}
        vignettes={vignettes}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAlgorithmLoading={isAlgorithmLoading}
        isVignettesLoading={isVignettesLoading}
        onGenerateVignettes={handleGenerateVignettes}
        onRefreshVignettes={handleRefreshVignettes}
        error={error}
      />
      
      {chatSession && !isAlgorithmLoading && (
        <FollowUpArea
            history={chatHistory}
            onSendMessage={handleSendFollowUp}
            isLoading={isFollowUpLoading}
        />
      )}

      <footer className="text-center mt-auto py-4">
        <p className="text-sm text-gray-500">Powered by AI. Always verify information with clinical guidelines.</p>
      </footer>
    </main>
  );
};

export default App;
