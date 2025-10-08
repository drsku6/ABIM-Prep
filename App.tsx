import React, { useState, useCallback } from 'react';
import { InputArea } from './components/InputArea';
import { OutputArea } from './components/OutputArea';
import { FollowUpArea } from './components/FollowUpArea';
import { startChatAndGenerateAlgorithm, generateVignettes, sendFollowUpMessageStream } from './services/geminiService';
import type { Content, TabType, ChatMessage } from './types';
import type { Chat } from '@google/genai';

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

  const handleGenerateAlgorithm = useCallback(async () => {
    if (!topic.trim()) return;

    setIsAlgorithmLoading(true);
    setError(null);
    setAlgorithm({ html: '' }); // Reset and initialize for streaming
    setVignettes(null); // Clear previous vignettes
    setActiveTab('algorithm');
    setChatSession(null);
    setChatHistory([]);

    try {
      const chat = await startChatAndGenerateAlgorithm(topic, (chunk) => {
        setAlgorithm(prev => ({ html: (prev?.html || '') + chunk }));
      });
      setChatSession(chat);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during algorithm generation.');
      }
      setAlgorithm(null); // Clear on error
      setChatSession(null);
    } finally {
      setIsAlgorithmLoading(false);
    }
  }, [topic]);

  const handleGenerateVignettes = useCallback(async () => {
    // Prevent re-fetching if vignettes exist, are loading, or there's no topic
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

      <OutputArea
        algorithm={algorithm}
        vignettes={vignettes}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAlgorithmLoading={isAlgorithmLoading}
        isVignettesLoading={isVignettesLoading}
        onGenerateVignettes={handleGenerateVignettes}
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