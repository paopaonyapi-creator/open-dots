'use client';

import React, { useState } from 'react';
import { FiX, FiZap } from 'react-icons/fi';
import { createBot } from '../lib/api';

const BOT_PRESETS = [
  {
    id: 'adobe-stock',
    emoji: '📸',
    accent: '#f59e0b',
    name: 'Stock Metadata Pro',
    role: 'Adobe Stock Metadata Specialist',
    description: 'สร้าง title / keywords / category มาตรฐาน Adobe Stock จากภาพหรือคอนเซ็ปต์',
    system_prompt:
      'You are an Adobe Stock metadata specialist for a stock contributor. Given an image description or attached image, produce: 1) Title in English (max 200 chars, descriptive, natural, no keyword stuffing), 2) 25-49 English keywords ordered by relevance (first 10 most important), 3) one Adobe Stock category, 4) 2-3 sentence Thai explanation. Output clean Markdown with sections: Title, Keywords (comma-separated), Category, คำอธิบาย.',
  },
  {
    id: 'code',
    emoji: '💻',
    accent: '#0a84ff',
    name: 'Code Companion',
    role: 'Senior Software Engineer',
    description: 'ช่วยอ่านโค้ด แก้บัค รีฟักเตอร์ และอธิบายโค้ดทีละขั้น',
    system_prompt:
      'You are a senior software engineer. Give precise, production-grade answers. Explain step by step, point out edge cases, and prefer minimal targeted changes over rewrites. Use fenced code blocks with language hints.',
  },
  {
    id: 'research',
    emoji: '🔎',
    accent: '#34d399',
    name: 'Research Assistant',
    role: 'Deep Research Analyst',
    description: 'สรุปงานวิจัย เปรียบเทียบทางเลือก และสรุปประเด็นเชิงลึกเป็นภาษาไทย',
    system_prompt:
      'You are a rigorous research analyst. Structure answers with clear headings, compare options in tables when useful, cite assumptions explicitly, and end with a concise recommendation. Reply in Thai unless asked otherwise.',
  },
  {
    id: 'writer',
    emoji: '✍️',
    accent: '#f472b6',
    name: 'Writing Partner',
    role: 'Bilingual Copywriter',
    description: 'ช่วยร่าง copy โพสต์ อีเมล และบทความ ทั้งไทยและอังกฤษ',
    system_prompt:
      'You are a bilingual (Thai/English) copywriter. Match the requested tone, offer 2-3 variants per request, and keep copy concise and scannable. Ask for the audience and goal when unclear.',
  },
  {
    id: 'translator',
    emoji: '🌐',
    accent: '#a78bfa',
    name: 'TH ⇄ EN Translator',
    role: 'Thai-English Translator',
    description: 'แปลไทย-อังกฤษแบบเป็นธรรมชาติ คงโทนและศัพท์เฉพาะทาง',
    system_prompt:
      'You are a professional Thai-English translator. Translate naturally, preserving tone, formality level, and domain-specific terms. When a term is ambiguous, list alternatives briefly. Output only the translation unless asked for notes.',
  },
  {
    id: 'custom',
    emoji: '🤖',
    accent: '#3b82f6',
    name: 'Custom Bot',
    role: 'AI Assistant',
    description: 'กำหนดเองทุกอย่าง — ชื่อ บทบาท และ system prompt',
    system_prompt: 'You are a helpful AI assistant.',
  },
];

export default function NewBotModal({ isOpen, onClose, onCreated, defaultModel }) {
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const pick = (preset) => {
    setSelected(preset);
    setName(preset.id === 'custom' ? '' : preset.name);
    setRole(preset.id === 'custom' ? '' : preset.role);
    setError('');
  };

  const close = () => {
    setSelected(null);
    setName('');
    setRole('');
    setError('');
    onClose();
  };

  const create = async (event) => {
    event.preventDefault();
    const preset = selected;
    if (!preset) return;
    const finalName = (name || preset.name).trim();
    if (!finalName) {
      setError('กรุณาตั้งชื่อ bot');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const newBot = await createBot({
        name: finalName,
        role: (role || preset.role || 'AI Assistant').trim(),
        model: defaultModel,
        description: preset.description,
        avatar: preset.emoji,
        accent_color: preset.accent,
        system_prompt: preset.system_prompt,
      });
      onCreated(newBot);
      close();
    } catch (err) {
      setError(err.message || 'สร้าง bot ไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/55 animate-fade-in"
      style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl max-h-[86vh] overflow-y-auto liquid-glass-strong rounded-3xl p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <FiZap className="text-[rgba(10,132,255,0.95)]" /> สร้าง Bot ใหม่
            </h2>
            <p className="text-xs text-zinc-400 mt-1">เลือก preset ที่ตั้งค่า system prompt ไว้ให้ หรือสร้างเองทั้งหมด</p>
          </div>
          <button onClick={close} className="p-2 rounded-lg text-zinc-400 hover:text-white glass-hover" aria-label="Close">
            <FiX />
          </button>
        </div>

        {/* Preset gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          {BOT_PRESETS.map((preset) => {
            const isActive = selected?.id === preset.id;
            return (
              <button
                type="button"
                key={preset.id}
                onClick={() => pick(preset)}
                className={`text-left p-3.5 rounded-2xl glass-row ${isActive ? 'glass-row-active' : 'border-white/10 bg-white/[0.03]'}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg select-none border border-white/10"
                    style={{ background: `${preset.accent}22` }}
                  >
                    {preset.emoji}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-zinc-100 truncate">{preset.name}</h3>
                    <p className="text-[10px] text-zinc-400 truncate">{preset.role}</p>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">{preset.description}</p>
              </button>
            );
          })}
        </div>

        {/* Detail form */}
        <form onSubmit={create} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs text-zinc-300 mb-1.5">ชื่อ bot</span>
              <input
                type="text"
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
                placeholder={selected?.name || 'ชื่อที่ต้องการ'}
                disabled={!selected}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)] focus:shadow-[0_0_0_4px_rgba(10,132,255,0.14)] disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="block text-xs text-zinc-300 mb-1.5">บทบาท</span>
              <input
                type="text"
                value={role}
                maxLength={80}
                onChange={(e) => setRole(e.target.value)}
                placeholder={selected?.role || 'เช่น Marketing Consultant'}
                disabled={!selected}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)] focus:shadow-[0_0_0_4px_rgba(10,132,255,0.14)] disabled:opacity-50"
              />
            </label>
          </div>

          <p className="text-[11px] text-zinc-500">
            โมเดล: <span className="text-zinc-300 font-medium">{defaultModel}</span> (เปลี่ยนได้ที่หัวหน้าแชทหลังสร้าง) · System prompt จาก preset แก้ไขภายหลังได้
          </p>

          {error && <p role="alert" className="text-xs text-red-300">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={close} className="rounded-xl px-4 py-2.5 text-sm text-zinc-300 glass-hover border border-white/10">
              ยกเลิก
            </button>
            <button type="submit" disabled={!selected || busy} className="btn-accent rounded-xl px-5 py-2.5 text-sm font-medium">
              {busy ? 'กำลังสร้าง…' : 'สร้าง Bot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
