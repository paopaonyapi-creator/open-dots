'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiSearch, FiMessageSquare, FiCornerDownLeft } from 'react-icons/fi';
import { searchMessages } from '../lib/api';

export default function SearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    return () => clearTimeout(debounceRef.current);
  }, [isOpen]);

  if (!isOpen) return null;

  const runSearch = (value) => {
    const q = value.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMessages(q);
        setResults(data.results || []);
        setSearched(true);
      } catch (err) {
        setError(err.message || 'ค้นหาไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center pt-[10vh] p-6 bg-black/55 animate-fade-in"
      style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl liquid-glass-strong rounded-3xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/8">
          <FiSearch className="text-zinc-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); runSearch(e.target.value); }}
            placeholder="ค้นหาทุกบทสนทนา…"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="text-[9px] font-mono text-zinc-500 border border-white/10 rounded px-1.5 py-0.5 flex-shrink-0">ESC</kbd>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white glass-hover rounded-lg" aria-label="Close">
            <FiX />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-0.5">
          {loading && <p className="text-center text-xs text-zinc-500 py-8">กำลังค้นหา…</p>}
          {error && <p role="alert" className="text-center text-xs text-red-300 py-6">{error}</p>}
          {!loading && searched && !error && results.length === 0 && (
            <p className="text-center text-xs text-zinc-500 py-8">ไม่พบ “{query}” ในบทสนทนาใดๆ</p>
          )}
          {!loading && !searched && (
            <p className="text-center text-xs text-zinc-600 py-10 leading-relaxed">
              พิมพ์เพื่อค้นหาข้อความจากทุกบทสนทนา ทุก bot<br />
              <span className="text-[10px] text-zinc-600">เปิดด้วย Ctrl+K ได้ตลอด</span>
            </p>
          )}
          {results.map((hit, index) => (
            <div
              key={`${hit.thread_id}-${hit.id || index}`}
              onClick={() => { onSelectResult && onSelectResult(hit); onClose(); }}
              className="group flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer glass-row"
            >
              <FiMessageSquare className="text-zinc-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200 leading-relaxed line-clamp-2">{hit.text}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {hit.created_at ? new Date(hit.created_at).toLocaleString() : ''}
                  {hit.sender === 'user' ? ' · คุณ' : ' · bot'}
                </p>
              </div>
              <FiCornerDownLeft className="text-zinc-600 mt-1 opacity-0 group-hover:opacity-100 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
