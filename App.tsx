import React, { useState, useCallback, useEffect, useRef } from 'react';
import { InputArea } from './components/InputArea';
import { OutputArea } from './components/OutputArea';
import { FollowUpArea } from './components/FollowUpArea';
import { Sidebar } from './components/Sidebar';
import { startChatAndGenerateAlgorithm, generateVignettes, sendFollowUpMessageStream, recreateChatSession } from './services/geminiService';
import { getMasterAlgorithmPrompt } from './prompts/masterAlgorithm';
import type { Content, TabType, ChatMessage, Session } from './types';
import type { Chat } from '@google/genai';
import { PanelLeftOpenIcon } from './components/icons/PanelLeftOpenIcon';

const SESSIONS_STORAGE_KEY = 'abimBoardMasterSessions';
const MIN_SIDEBAR_WIDTH = 240;
const DEFAULT_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 500;

const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [topic, setTopic] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [algorithm, setAlgorithm] = useState<Content | null>(null);
  const [vignettes, setVignettes] = useState<Content | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [isAlgorithmLoading, setIsAlgorithmLoading] = useState<boolean>(false);
  const [isVignettesLoading, setIsVignettesLoading] = useState<boolean>(false);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<TabType>('algorithm');
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const isResizing = useRef(false);

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        setSessions(parsedSessions);
        if (parsedSessions.length > 0) {
          handleSelectSession(parsedSessions[0].id, parsedSessions);
        }
      }
    } catch (e) {
      console.error("Failed to parse sessions from localStorage", e);
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      let newWidth = e.clientX;
      if (newWidth < MIN_SIDEBAR_WIDTH) newWidth = MIN_SIDEBAR_WIDTH;
      if (newWidth > MAX_SIDEBAR_WIDTH) newWidth = MAX_SIDEBAR_WIDTH;
      setSidebarWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  const updateSessionInStorage = (updatedSessions: Session[]) => {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
  }

  const handleNewSession = () => {
    setActiveSessionId(null);
    setTopic('');
    setError(null);
    setAlgorithm(null);
    setVignettes(null);
    setChatHistory([]);
    setChatSession(null);
    setIsAlgorithmLoading(false);
    setIsVignettesLoading(false);
    setIsFollowUpLoading(false);
    setActiveTab('algorithm');
    // Optionally close sidebar on mobile, but user wants desktop-like toggle. Keeping as is.
  };

  const handleSelectSession = useCallback((sessionId: string, currentSessions = sessions) => {
    const sessionToLoad = currentSessions.find(s => s.id === sessionId);
    if (sessionToLoad) {
      setActiveSessionId(sessionId);
      setTopic(sessionToLoad.topic);
      setAlgorithm(sessionToLoad.algorithm);
      setVignettes(sessionToLoad.vignettes);
      setChatHistory(sessionToLoad.chatHistory);
      setChatSession(null); // Will be recreated on first follow-up
      setError(null);
      setIsAlgorithmLoading(false);
      setIsVignettesLoading(false);
      setIsFollowUpLoading(false);
      setActiveTab('algorithm');
    }
  }, [sessions]);

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    updateSessionInStorage(updatedSessions);
    
    if (activeSessionId === sessionId) {
        if (updatedSessions.length > 0) {
            handleSelectSession(updatedSessions[0].id, updatedSessions);
        } else {
            handleNewSession();
        }
    }
  };

  const generateVignettesForSession = useCallback(async (sessionId: string, sessionTopic: string) => {
    // If this session is the active one, show the loading spinner.
    if (activeSessionId === sessionId) {
        setIsVignettesLoading(true);
        setError(null);
    }

    try {
        const result = await generateVignettes(sessionTopic);
        
        // Update the sessions array state safely
        setSessions(prevSessions => {
            const updatedSessions = prevSessions.map(s => 
                s.id === sessionId ? { ...s, vignettes: result } : s
            );
            updateSessionInStorage(updatedSessions);
            return updatedSessions;
        });
        
        // If the session is still active, update the component's direct view state
        if (activeSessionId === sessionId) {
            setVignettes(result);
        }
    } catch (err) {
        console.error(`Vignette generation for session ${sessionId} failed:`, err);
        if (activeSessionId === sessionId) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during vignette generation.');
        }
    } finally {
        if (activeSessionId === sessionId) {
            setIsVignettesLoading(false);
        }
    }
  }, [activeSessionId]);


  const handleGenerateAlgorithm = useCallback(async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;
    
    // Reset output states for the new generation, but keep the topic input
    setError(null);
    setAlgorithm({ html: '' });
    setVignettes(null);
    setChatHistory([]);
    setChatSession(null);
    setActiveTab('algorithm');
    setIsVignettesLoading(false);
    setIsFollowUpLoading(false);
    setIsAlgorithmLoading(true);

    const newSessionId = Date.now().toString();
    const newSession: Session = {
      id: newSessionId,
      topic: trimmedTopic,
      title: trimmedTopic.length > 40 ? `${trimmedTopic.substring(0, 40)}...` : trimmedTopic,
      algorithm: { html: '' },
      vignettes: null,
      chatHistory: [],
    };

    setActiveSessionId(newSessionId);

    let finalAlgorithmHtml = '';
    try {
      const chat = await startChatAndGenerateAlgorithm(trimmedTopic, (chunk) => {
        finalAlgorithmHtml += chunk;
        setAlgorithm({ html: finalAlgorithmHtml });
      });
      setChatSession(chat);

      const finalSession: Session = { ...newSession, algorithm: { html: finalAlgorithmHtml }};
      const updatedSessions = [finalSession, ...sessions];
      setSessions(updatedSessions);
      updateSessionInStorage(updatedSessions);

      // Automatically start generating vignettes in the background
      generateVignettesForSession(newSessionId, trimmedTopic);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAlgorithm(null);
      setChatSession(null);
      setActiveSessionId(null);
      // Remove the failed session attempt
      setSessions(prev => prev.filter(s => s.id !== newSessionId));
    } finally {
      setIsAlgorithmLoading(false);
    }
  }, [topic, sessions, generateVignettesForSession]);
  
  const updateActiveSessionData = (data: Partial<Session>) => {
      if (!activeSessionId) return;
      setSessions(prevSessions => {
          const updatedSessions = prevSessions.map(s => s.id === activeSessionId ? { ...s, ...data } : s);
          updateSessionInStorage(updatedSessions);
          return updatedSessions;
      });
  };

  const handleGenerateVignettes = useCallback(async () => {
    if (vignettes || isVignettesLoading || !topic || !activeSessionId) return;
    await generateVignettesForSession(activeSessionId, topic);
  }, [topic, vignettes, isVignettesLoading, activeSessionId, generateVignettesForSession]);

  const handleRefreshVignettes = useCallback(async () => {
    if (isVignettesLoading || !topic || !activeSessionId) return;
    setVignettes(null); 
    await generateVignettesForSession(activeSessionId, topic);
  }, [topic, isVignettesLoading, activeSessionId, generateVignettesForSession]);

  const handleSendFollowUp = useCallback(async (message: string) => {
    if (!message.trim() || !activeSessionId) return;

    setIsFollowUpLoading(true);
    setError(null);
    
    let sessionToUse = chatSession;
    if (!sessionToUse) {
      const apiHistory = [
        { role: 'user' as const, html: getMasterAlgorithmPrompt(topic) },
        { role: 'model' as const, html: algorithm?.html || '' },
        ...chatHistory
      ];
      sessionToUse = recreateChatSession(apiHistory);
      setChatSession(sessionToUse);
    }

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', html: message }];
    newHistory.push({ role: 'model', html: '' });
    setChatHistory(newHistory);

    try {
      await sendFollowUpMessageStream(sessionToUse, message, (chunk) => {
        setChatHistory(prev => {
          const updatedHistory = [...prev];
          const lastMessage = updatedHistory[updatedHistory.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.html += chunk;
          }
          return updatedHistory;
        });
      });

      // After streaming is complete, update the session in storage
      setChatHistory(prevFinalHistory => {
          updateActiveSessionData({ chatHistory: prevFinalHistory });
          return prevFinalHistory;
      });

    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
       setChatHistory(prev => {
          const updatedHistory = [...prev];
          const lastMessage = updatedHistory[updatedHistory.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.html = `<p class="text-red-600"><strong>Error:</strong> ${errorMessage}</p>`;
          }
          updateActiveSessionData({ chatHistory: updatedHistory });
          return updatedHistory;
       });
    } finally {
      setIsFollowUpLoading(false);
    }
  }, [chatSession, chatHistory, activeSessionId, sessions, topic, algorithm]);

  return (
    <div className="flex h-screen bg-brand-background text-brand-text font-serif">
      {isSidebarOpen && (
        <>
            <Sidebar
                width={sidebarWidth}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewSession={handleNewSession}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div 
                className="h-full cursor-col-resize w-1.5 bg-gray-200 hover:bg-brand-blue transition-colors duration-200 flex-shrink-0"
                onMouseDown={handleMouseDown}
                aria-label="Resize sidebar"
                role="separator"
            />
        </>
      )}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {!isSidebarOpen && (
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-4 left-4 z-20 p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Open sidebar"
            >
                <PanelLeftOpenIcon className="w-6 h-6" />
            </button>
        )}
        <div className="p-4 sm:p-8 flex-1 flex flex-col items-center w-full">
            <header className="text-center my-8 sm:my-12 w-full">
                <h1 className="font-sans text-4xl sm:text-5xl font-bold text-brand-blue">
                ABIM Board Master
                </h1>
                <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
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
                onRefreshVignettes={handleRefreshVignettes}
                error={error}
            />
            
            {activeSessionId && !isAlgorithmLoading && (
                <FollowUpArea
                    history={chatHistory}
                    onSendMessage={handleSendFollowUp}
                    isLoading={isFollowUpLoading}
                />
            )}

            <footer className="text-center mt-auto py-4">
                <p className="text-sm text-gray-500">Powered by AI. Always verify information with clinical guidelines.</p>
            </footer>
        </div>
      </main>
    </div>
  );
};

export default App;