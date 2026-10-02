'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiX, FiCopy, FiCheck, FiVolume2, FiVolumeX } from 'react-icons/fi';

function formatMsgTime(createdAt) {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function MessageItem({ message }) {
  const isUser = message.sender === 'user';
  const isError = message.isError || message.text?.toLowerCase().startsWith('error:');
  const formattedTime = formatMsgTime(message.created_at);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(message.text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const toggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const plain = (message.text || '')
      .replace(/```[\s\S]*?```/g, ' (โค้ด) ')
      .replace(/[#*_`>\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!plain) return;
    const utterance = new SpeechSynthesisUtterance(plain.slice(0, 1200));
    utterance.lang = 'th-TH';
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-1.5 group">
        <div className="dark-bubble-user px-3.5 py-2 text-xs font-sans max-w-md">
          {message.image_url && (
            <img
              src={message.image_url}
              alt="Uploaded image attachment"
              className="max-w-full max-h-56 rounded-lg object-cover border border-white/10 mb-1.5"
            />
          )}
          <div className="flex justify-end gap-3 items-end">
            <span className="break-words">{message.text}</span>
            {formattedTime && (
              <span className="text-[10px] text-white/70 font-mono tracking-tight select-none flex-shrink-0 self-end ml-auto">
                {formattedTime}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start my-2">
        <div className="dark-bubble-error px-4 py-1.5 text-xs font-mono max-w-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FiX className="text-red-500 text-sm flex-shrink-0" />
            <span className="truncate">{message.text}</span>
          </div>
          {formattedTime && (
            <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">{formattedTime}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-2 group">
      <div className="relative dark-bubble-bot px-5 py-3 text-xs font-sans max-w-2xl text-zinc-100 leading-relaxed overflow-hidden">
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <div className="mb-2 last:mb-0 leading-relaxed" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
            code: ({ node, inline, className, children, ...props }) => {
              const isInline = inline || (!className && typeof children === 'string' && !children.includes('\n'));
              if (isInline) {
                return (
                  <code className="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-[11px]" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <pre className="bg-black/40 p-3 rounded-xl border border-white/10 text-zinc-300 font-mono text-[11px] overflow-x-auto my-2">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-1 text-zinc-300" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-1 text-zinc-300" {...props} />,
          }}
        >
          {message.text}
        </ReactMarkdown>

        <div className="flex items-center justify-between mt-1.5">
          {formattedTime && (
            <span className="text-[10px] text-zinc-500 font-mono tracking-tight select-none">
              {formattedTime}
            </span>
          )}
          <button
            type="button"
            onClick={toggleSpeak}
            title={speaking ? 'หยุดอ่าน' : 'อ่านออกเสียง'}
            className={`flex items-center gap-1 text-[10px] font-medium rounded-lg px-2 py-1 transition-all glass-hover border border-transparent hover:border-white/10 ${
              speaking ? 'text-[rgba(10,132,255,0.95)]' : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            {speaking ? <FiVolumeX className="text-xs" /> : <FiVolume2 className="text-xs" />}
            {speaking ? 'หยุด' : 'ฟัง'}
          </button>
          <button
            type="button"
            onClick={copyText}
            title={copied ? 'Copied!' : 'Copy message'}
            className={`ml-auto flex items-center gap-1 text-[10px] font-medium rounded-lg px-2 py-1 transition-all glass-hover border border-transparent hover:border-white/10 ${
              copied ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            {copied ? <FiCheck className="text-xs" /> : <FiCopy className="text-xs" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
