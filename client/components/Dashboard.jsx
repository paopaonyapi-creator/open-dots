'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ComputerPanel from './ComputerPanel';
import Marketplace from './Marketplace';
import AuditPanel from './AuditPanel';
import AppSettingsDrawer from './AppSettingsDrawer';
import NewBotModal from './NewBotModal';
import MemoryModal from './MemoryModal';
import SearchModal from './SearchModal';
import BotSettingsModal from './BotSettingsModal';

import {
  fetchBots,
  fetchModels,
  fetchChatHistory,
  fetchSettings,
  fetchThreads,
  createThread,
  deleteThreadApi,
  renameThread,
  updateBot,
  deleteBot,
  setBotMemory
} from '../lib/api';

export default function Dashboard({ onLogout }) {
  const [bots, setBots] = useState([]);
  const [models, setModels] = useState([]);
  const [activeBotId, setActiveBotId] = useState('');
  const [activeThreadId, setActiveThreadId] = useState('');
  const [threads, setThreads] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'computer' | 'marketplace' | 'audit'
  const [messages, setMessages] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewBotOpen, setIsNewBotOpen] = useState(false);
  const [memoryBot, setMemoryBot] = useState(null);
  const [settingsBot, setSettingsBot] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const threadOverrideRef = useRef(null);
  const [defaultModel, setDefaultModel] = useState('gpt-5-mini');
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('open_dots_user_name') || 'You';
    }
    return 'You';
  });

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        const [botsData, modelsData, settingsData] = await Promise.all([fetchBots(), fetchModels(), fetchSettings()]);
        setBots(botsData);
        setModels(modelsData);
        if (settingsData?.default_model) {
          setDefaultModel(settingsData.default_model);
        }
        if (botsData.length > 0) {
          setActiveBotId(botsData[0].id);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    initData();
  }, []);

  // Load the bot's conversation threads and select its main thread.
  // A search-result jump overrides the default main-thread selection.
  useEffect(() => {
    if (!activeBotId) return;
    let cancelled = false;
    const targetThread = threadOverrideRef.current || activeBotId;
    threadOverrideRef.current = null;
    setActiveThreadId(targetThread);
    setMessages([]);
    fetchThreads(activeBotId)
      .then((list) => { if (!cancelled) setThreads(list); })
      .catch((err) => console.error('Failed to load threads:', err));
    return () => { cancelled = true; };
  }, [activeBotId]);

  // Fetch chat history for the active conversation thread.
  useEffect(() => {
    if (!activeThreadId) return;
    fetchChatHistory(activeThreadId)
      .then((history) => setMessages(history))
      .catch((err) => console.error('Failed to load history:', err));
  }, [activeThreadId]);

  const activeBot = bots.find((b) => b.id === activeBotId) || bots[0];

  // Ctrl+K opens global chat search from anywhere.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearchSelect = (hit) => {
    if (hit.bot_id) {
      threadOverrideRef.current = hit.thread_id;
      setActiveBotId(hit.bot_id);
      setActiveTab('chat');
    }
    if (hit.thread_id) setActiveThreadId(hit.thread_id);
  };

  const handleUpdateBotModel = async (botId, newModel) => {
    try {
      const updated = await updateBot(botId, { model: newModel });
      setBots((prev) => prev.map((b) => (b.id === botId ? updated : b)));
    } catch (err) {
      console.error('Failed to update bot model:', err);
    }
  };

  const handleRenameBot = async (botId, newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed) return;
    try {
      const updated = await updateBot(botId, { name: trimmed });
      setBots((prev) => prev.map((b) => (b.id === botId ? updated : b)));
    } catch (err) {
      console.error('Failed to rename bot:', err);
    }
  };

  const handleDeleteBot = async (botId) => {
    try {
      await deleteBot(botId);
      const remaining = bots.filter((b) => b.id !== botId);
      setBots(remaining);
      if (activeBotId === botId) {
        setActiveBotId(remaining[0]?.id || '');
        if (!remaining.length) setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete bot:', err);
    }
  };

  const handleSetMemory = async (botId, memory) => {
    const updated = await setBotMemory(botId, memory);
    setBots((prev) => prev.map((b) => (b.id === botId ? updated : b)));
  };

  const handleSaveBotSettings = (updated) => {
    setBots((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (models.length && !models.some((m) => m.id === updated.model)) {
      fetchModels().then((fresh) => setModels(fresh)).catch(() => {});
    }
  };

  const handleCreateThread = async () => {
    if (!activeBotId) return;
    try {
      const thread = await createThread(activeBotId);
      setThreads((prev) => [thread, ...prev.filter((t) => t.id !== thread.id)]);
      setActiveThreadId(thread.id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create thread:', err);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!activeBotId) return;
    try {
      await deleteThreadApi(activeBotId, threadId);
      const remaining = threads.filter((t) => t.id !== threadId);
      setThreads(remaining);
      if (activeThreadId === threadId) {
        setActiveThreadId(activeBotId);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  const handleRenameThread = async (threadId, title) => {
    if (!activeBotId || !title) return;
    try {
      const updated = await renameThread(activeBotId, threadId, title);
      setThreads((prev) => prev.map((t) => (t.id === threadId ? updated : t)));
    } catch (err) {
      console.error('Failed to rename thread:', err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-zinc-100 font-sans">
      {/* Sidebar Navigation & Bot Roster */}
      <Sidebar
        onLogout={onLogout}
        bots={bots}
        activeBotId={activeBotId}
        userName={userName}
        onSelectBot={(id) => {
          setActiveBotId(id);
          setActiveTab('chat');
        }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        onOpenNewBot={() => setIsNewBotOpen(true)}
        onRenameBot={handleRenameBot}
        onDeleteBot={handleDeleteBot}
        onOpenMemory={(bot) => setMemoryBot(bot)}
        onOpenBotSettings={(bot) => setSettingsBot(bot)}
      />

      {/* Main Workspace Display Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {activeTab === 'chat' && (
          <ChatWindow
            bot={activeBot}
            models={models}
            messages={messages}
            setMessages={setMessages}
            threads={threads}
            activeThreadId={activeThreadId}
            onSelectThread={(id) => setActiveThreadId(id)}
            onCreateThread={handleCreateThread}
            onDeleteThread={handleDeleteThread}
            onRenameThread={handleRenameThread}
            onUpdateBotModel={handleUpdateBotModel}
            onToggleComputer={() => setActiveTab('computer')}
            defaultModel={defaultModel}
          />
        )}

        {activeTab === 'computer' && (
          <ComputerPanel bot={activeBot} onBackToChat={() => setActiveTab('chat')} />
        )}

        {activeTab === 'marketplace' && (
          <Marketplace onOpenSettings={() => setIsSettingsOpen(true)} />
        )}

        {activeTab === 'audit' && <AuditPanel />}
      </main>

      {/* Right Side App Settings Drawer Panel */}
      <AppSettingsDrawer
        models={models}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentModel={defaultModel}
        onUpdateDefaultModel={async (newModel) => {
          setDefaultModel(newModel);
          setModels(await fetchModels());
        }}
        onProfileUpdate={(name) => setUserName(name || 'You')}
      />

      {/* New Bot Modal with Presets */}
      <NewBotModal
        isOpen={isNewBotOpen}
        onClose={() => setIsNewBotOpen(false)}
        defaultModel={defaultModel}
        onCreated={(newBot) => {
          setBots((prev) => [...prev, newBot]);
          setActiveBotId(newBot.id);
          setActiveTab('chat');
        }}
      />

      {/* Long-term Memory Modal */}
      <MemoryModal
        bot={memoryBot}
        onClose={() => setMemoryBot(null)}
        onSave={handleSetMemory}
      />

      {/* Bot Settings Modal (persona / prompt / model) */}
      <BotSettingsModal
        bot={settingsBot}
        models={models}
        onClose={() => setSettingsBot(null)}
        onSaved={handleSaveBotSettings}
      />

      {/* Global Chat Search (Ctrl+K) */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={handleSearchSelect}
      />
    </div>
  );
}
