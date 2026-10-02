'use client';

import React, { useState, useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import ApprovalCard from './ApprovalCard';
import ModelPicker from './ModelPicker';
import MascotAvatar from './MascotAvatar';
import { FiPlus, FiMic, FiMicOff, FiMonitor, FiX, FiImage, FiRotateCcw, FiDownload, FiMessageSquare, FiChevronDown, FiCheck, FiTrash2 } from 'react-icons/fi';
import {
  sendMessage,
  subscribeToChatStream,
  uploadImage,
  respondApproval,
  clearChatHistory,
} from '../lib/api';

function formatHeaderDate(msgs) {
  const firstWithDate = msgs?.find((m) => m.created_at);
  if (!firstWithDate || !firstWithDate.created_at) {
    return 'Today';
  }
  const d = new Date(firstWithDate.created_at);
  if (isNaN(d.getTime())) return 'Today';

  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return 'Today';
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ThreadsDropdown({ threads, activeThreadId, onSelectThread, onCreateThread, onDeleteThread }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const active = (threads || []).find((t) => t.id === activeThreadId);
  const title = active?.title || 'แชทหลัก';

  return (
    <div className="relative z-50" ref={ref} suppressHydrationWarning={true}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass glass-hover text-xs text-zinc-200 transition font-medium"
        title="สลับบทสนทนา"
      >
        <FiMessageSquare className="text-[11px] text-[rgba(10,132,255,0.9)]" />
        <span className="max-w-[140px] truncate">{title}</span>
        <FiChevronDown className={`text-zinc-400 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[300px] dark-popover rounded-2xl z-50 overflow-hidden animate-scale-in">
          <button
            onClick={() => { onCreateThread && onCreateThread(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-[rgba(10,132,255,0.95)] hover:bg-white/[0.05] transition border-b border-white/8"
          >
            <FiPlus /> แชทใหม่
          </button>
          <div className="max-h-[280px] overflow-y-auto p-1.5 space-y-0.5">
            {(threads || []).length === 0 && (
              <p className="text-[11px] text-zinc-500 text-center py-4">ยังไม่มีบทสนทนา</p>
            )}
            {(threads || []).map((t) => {
              const isActive = t.id === activeThreadId;
              const isMain = t.id === t.bot_id;
              return (
                <div
                  key={t.id}
                  onClick={() => { onSelectThread && onSelectThread(t.id); setOpen(false); }}
                  className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer glass-row ${isActive ? 'glass-row-active' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-medium truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>{t.title || 'แชท'}</p>
                    <p className="text-[9px] text-zinc-500">{t.updated_at ? new Date(t.updated_at).toLocaleString() : ''}</p>
                  </div>
                  {!isMain && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteThread && onDeleteThread(t.id); }}
                      className="p-1 rounded-md text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
                      title="ลบเธรดนี้"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  )}
                  {isActive && <FiCheck className="text-xs text-[rgba(10,132,255,0.95)] flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatWindow({ bot, models, messages, setMessages, threads, activeThreadId, onSelectThread, onCreateThread, onDeleteThread, onUpdateBotModel, onToggleComputer, defaultModel }) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeModel, setActiveModel] = useState(bot?.model || defaultModel || 'gpt-5-mini');
  const [selectedImage, setSelectedImage] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [toolEvents, setToolEvents] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const clearTimerRef = useRef(null);

  const botTitle = bot?.name || 'Open Dots Assistant';

  // Initial welcome greeting fallback for the active bot
  const defaultInitialMessages = [
    {
      id: 'msg-intro',
      sender: 'bot',
      text: `Hello! I am **${botTitle}**. Ask me anything, or give me a task to work on!`,
      isError: false,
    },
  ];

  const activeMessages = messages && messages.length > 0 ? messages : defaultInitialMessages;

  useEffect(() => {
    if (bot?.model) {
      setActiveModel(bot.model);
    } else if (defaultModel) {
      setActiveModel(defaultModel);
    }
  }, [bot, defaultModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isStreaming]);

  const handleModelChange = (newModel) => {
    setActiveModel(newModel);
    if (onUpdateBotModel && bot?.id) {
      onUpdateBotModel(bot.id, newModel);
    }
  };

  const handleApprovalResponse = async (requestId, action) => {
    await respondApproval(requestId, action);
  };

  const handleNewChat = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearTimeout(clearTimerRef.current);
    setConfirmClear(false);
    try {
      if (bot?.id) await clearChatHistory(bot.id);
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
    setMessages([]);
  };

  React.useEffect(() => () => clearTimeout(clearTimerRef.current), []);

  const handleExportChat = () => {
    const realMessages = (messages || []).filter((m) => (m.text || '').trim());
    if (!realMessages.length) return;
    const lines = [`# ${botTitle} — chat export`, '', `_Exported ${new Date().toLocaleString()}_`, ''];
    for (const m of realMessages) {
      const who = m.sender === 'user' ? '🧑 You' : `🤖 ${botTitle}`;
      const time = m.created_at ? new Date(m.created_at).toLocaleString() : '';
      lines.push(`## ${who}${time ? ` — ${time}` : ''}`, '', m.text || '', '', '---', '');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dotsbypao-${(botTitle || 'chat').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict IMAGE ONLY validation
    if (!file.type.startsWith('image/')) {
      alert('Only image files (JPEG, PNG, WEBP, GIF, AVIF) are allowed.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedImage({ file, previewUrl, isUploading: true, uploadedUrl: null, error: null });

    try {
      const res = await uploadImage(file);
      setSelectedImage((prev) => (prev ? { ...prev, isUploading: false, uploadedUrl: res.url } : null));
    } catch (err) {
      console.error('Failed to upload image:', err);
      setSelectedImage((prev) => (prev ? { ...prev, isUploading: false, error: err.message } : null));
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputPrompt.trim() && !selectedImage) || isStreaming) return;

    const userText = inputPrompt;
    const currentSelected = selectedImage;
    
    setInputPrompt('');
    setSelectedImage(null);

    let finalImageUrl = currentSelected?.uploadedUrl || null;

    // Ensure image upload finishes before dispatching to the inference backend
    if (currentSelected && !finalImageUrl) {
      try {
        const res = await uploadImage(currentSelected.file);
        finalImageUrl = res.url;
      } catch (err) {
        console.error('Image upload failed on send:', err);
      }
    }

    const userMsgObj = {
      id: `temp-user-${Date.now()}`,
      sender: 'user',
      text: userText,
      image_url: currentSelected?.previewUrl || finalImageUrl,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsgObj]);

    try {
      if (bot?.id && activeThreadId) {
        await sendMessage(activeThreadId, bot.id, userText, activeModel, finalImageUrl);
        setIsStreaming(true);
        let streamingMsgId = null;


        subscribeToChatStream(
          activeThreadId,
          activeModel,
          (event) => {
            if (event.type === 'turn.started') {
              streamingMsgId = event.botMsgId;
              setMessages((prev) => [
                ...prev,
                {
                  id: streamingMsgId,
                  sender: 'bot',
                  text: '',
                  created_at: new Date().toISOString(),
                },
              ]);
            } else if (event.type === 'request.opened') {
              setPendingApprovals((prev) => [
                ...prev.filter((approval) => approval.requestId !== event.requestId),
                event,
              ]);
            } else if (['tool.started', 'tool.completed', 'tool.failed', 'tool.denied', 'tool.expired'].includes(event.type)) {
              setToolEvents((prev) => [
                ...prev.slice(-4),
                { ...event, id: `${event.type}-${Date.now()}` },
              ]);
              if (event.type === 'tool.expired') {
                setPendingApprovals((prev) => prev.filter((approval) => approval.requestId !== event.requestId));
              }
            } else if (event.type === 'content.delta') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === streamingMsgId
                    ? { ...msg, text: msg.text + event.delta }
                    : msg
                )
              );
            } else if (event.type === 'turn.completed') {
              setIsStreaming(false);
            }
          },
          () => setIsStreaming(false)
        );
      }
    } catch (err) {
      console.error('Send message error:', err);
      setIsStreaming(false);
    }
  };


  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputPrompt((prev) => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative select-none font-sans text-zinc-100">
      {/* Top Header Bar */}
      <header className="px-6 py-3.5 flex items-center justify-between z-20 border-b border-white/8"
        style={{ background: 'rgba(10,10,12,0.45)', WebkitBackdropFilter: 'blur(28px) saturate(180%)', backdropFilter: 'blur(28px) saturate(180%)' }}>
        {/* Left Side: Bot Indicator */}
        <div className="flex items-center gap-2.5">
          <MascotAvatar type={bot?.isError ? 'warning' : 'blue'} size="sm" />
          <div>
            <h2 className="font-bold text-sm text-zinc-100 tracking-wide leading-tight">{botTitle}</h2>
            {bot?.role && <p className="text-[10px] text-zinc-500 leading-tight">{bot.role}</p>}
          </div>
        </div>


        {/* Right Side: Threads, Export, New Chat, Model Picker & Computer Monitor Toggle */}
        <div className="flex items-center gap-3">
          <ThreadsDropdown
            threads={threads}
            activeThreadId={activeThreadId}
            onSelectThread={onSelectThread}
            onCreateThread={onCreateThread}
            onDeleteThread={onDeleteThread}
          />

          <button
            suppressHydrationWarning={true}
            onClick={handleExportChat}
            disabled={!messages || messages.length === 0}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white glass-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export chat as Markdown (.md)"
          >
            <FiDownload className="text-base" />
          </button>

          <button
            suppressHydrationWarning={true}
            onClick={handleNewChat}
            className={`p-1.5 rounded-lg transition ${
              confirmClear
                ? 'text-rose-300 bg-rose-500/15'
                : 'text-zinc-400 hover:text-white glass-hover'
            }`}
            title={confirmClear ? 'คลิกอีกครั้งเพื่อยืนยันล้างแชท' : 'New chat (ล้างบทสนทนานี้)'}
          >
            <FiRotateCcw className="text-base" />
          </button>

          <ModelPicker
            models={models}
            currentModel={activeModel}
            onSelectModel={handleModelChange}
          />

          <button
            suppressHydrationWarning={true}
            onClick={onToggleComputer}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white glass-hover transition"
            title="Toggle Desktop Screen Preview"
          >
            <FiMonitor className="text-base" />
          </button>
        </div>
      </header>

      {/* Main Canvas Scrollable Chat Thread */}
      <div className="flex-1 overflow-y-auto px-6 py-4 relative">
        <div className="max-w-4xl mx-auto w-full space-y-3 px-12 md:px-20">
          {/* Centered Recorded Timestamp */}
          <div className="text-center my-4">
            <span className="text-[11px] font-medium text-zinc-500 font-sans tracking-wide">
              {formatHeaderDate(activeMessages)}
            </span>
          </div>

          {pendingApprovals.map((approval) => (
            <ApprovalCard
              key={approval.requestId}
              approval={approval}
              onRespond={handleApprovalResponse}
            />
          ))}

          {toolEvents.map((event) => (
            <div
              key={event.id}
              className="my-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-[11px] text-slate-300"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-cyan-300">{event.tool || 'workspace'}</span>
                <span className={event.type === 'tool.completed' ? 'text-emerald-400' : 'text-amber-400'}>
                  {event.type.replace('tool.', '')}
                </span>
              </div>
              {event.error && <p className="mt-1 text-rose-300">{event.error}</p>}
              {event.result && (
                <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-slate-400">
                  {JSON.stringify(event.result, null, 2)}
                </pre>
              )}
            </div>
          ))}

          {/* Message Items List */}
          {activeMessages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}

          {isStreaming && (
            <div className="flex justify-start items-center gap-3 my-3 animate-fade-in">
              <MascotAvatar type={bot?.isError ? 'warning' : 'blue'} size="sm" />
              <div className="dark-bubble-bot px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[rgba(10,132,255,0.9)] animate-bounce" style={{ animationDelay: '-0.32s' }} />
                <span className="w-2 h-2 rounded-full bg-[rgba(10,132,255,0.9)] animate-bounce" style={{ animationDelay: '-0.16s' }} />
                <span className="w-2 h-2 rounded-full bg-[rgba(10,132,255,0.9)] animate-bounce" style={{ animationDelay: '0s' }} />
              </div>
            </div>
          )}


          <div ref={messagesEndRef} />
        </div>
      </div>


      {/* Bottom Floating Pill Composer Input */}
      <div className="p-6 flex flex-col items-center z-20 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
        {/* Hidden Image File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Selected Image Thumbnail Preview Chip */}
        {selectedImage && (
          <div className="w-full max-w-2xl flex items-center justify-between liquid-glass px-3 py-1.5 rounded-2xl mb-2 text-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <img
                src={selectedImage.previewUrl}
                alt="Selected Image Preview"
                className="w-9 h-9 rounded-lg object-cover border border-white/10 shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-zinc-200 font-semibold text-[11px] truncate max-w-[180px]">
                  {selectedImage.file.name}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {selectedImage.isUploading
                    ? 'Uploading image...'
                    : selectedImage.error
                    ? `Upload notice: ${selectedImage.error}`
                    : 'Image ready'}
                </span>
              </div>
            </div>

            <button
              suppressHydrationWarning={true}
              type="button"
              onClick={() => setSelectedImage(null)}
              className="text-zinc-400 hover:text-white p-1 rounded-md glass-hover transition"
              title="Remove image"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="w-full max-w-2xl dark-pill-input px-4 py-2.5 flex items-center gap-3"
        >
          {/* Plus / Image Upload Action Button */}
          <button
            suppressHydrationWarning={true}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-zinc-400 hover:text-white transition p-1 text-base flex-shrink-0"
            title="Upload Image (JPEG, PNG, WEBP, GIF, AVIF)"
          >
            <FiPlus />
          </button>

          {/* Textarea Input */}
          <textarea
            suppressHydrationWarning={true}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            placeholder={`Message ${botTitle}`}
            className="w-full resize-y bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none max-h-40"
          />

          {/* Microphone Dictation Button */}
          <button
            suppressHydrationWarning={true}
            type="button"
            onClick={handleVoiceToggle}
            className={`p-1.5 rounded-full text-base transition flex-shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Dictate Voice Input"
          >
            {isListening ? <FiMicOff /> : <FiMic />}
          </button>

        </form>
      </div>

    </div>
  );
}
