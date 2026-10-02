'use client';

import React, { useState } from 'react';
import { FiX, FiSettings } from 'react-icons/fi';
import { updateBot } from '../lib/api';

export default function BotSettingsModal({ bot, models, onClose, onSaved }) {
  const [name, setName] = useState(bot?.name || '');
  const [role, setRole] = useState(bot?.role || '');
  const [description, setDescription] = useState(bot?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(bot?.system_prompt || '');
  const [model, setModel] = useState(bot?.model || '');
  const [avatar, setAvatar] = useState(bot?.avatar || '🤖');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!bot) return null;

  const save = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('กรุณาตั้งชื่อ bot');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateBot(bot.id, {
        name: name.trim(),
        role: role.trim() || 'AI Assistant',
        description: description.trim(),
        system_prompt: systemPrompt,
        model: model.trim() || bot.model,
        avatar: avatar.trim() || '🤖',
      });
      onSaved && onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/55 animate-fade-in"
      style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl max-h-[86vh] overflow-y-auto liquid-glass-strong rounded-3xl p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl btn-accent flex items-center justify-center text-base">
              <FiSettings />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">ตั้งค่า bot</h2>
              <p className="text-[11px] text-zinc-400">แก้ persona / system prompt / โมเดล — ความจำ 🧠 และประวัติแชทจะไม่หาย</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-white glass-hover" aria-label="Close">
            <FiX />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-xs text-zinc-300 mb-1.5">ชื่อ bot</span>
              <input
                type="text"
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-100 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)]"
              />
            </label>
            <label className="block">
              <span className="block text-xs text-zinc-300 mb-1.5">บทบาท</span>
              <input
                type="text"
                value={role}
                maxLength={80}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-100 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)]"
              />
            </label>
            <label className="block">
              <span className="block text-xs text-zinc-300 mb-1.5">อีโมจิ avatar</span>
              <input
                type="text"
                value={avatar}
                maxLength={4}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-100 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)]"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs text-zinc-300 mb-1.5">คำอธิบาย</span>
            <input
              type="text"
              value={description}
              maxLength={200}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-100 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)]"
            />
          </label>

          <label className="block">
            <span className="block text-xs text-zinc-300 mb-1.5">โมเดล</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-100 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)]"
            >
              {(models || []).map((m) => (
                <option key={m.id} value={m.id} className="bg-[#16161a]">
                  {m.name || m.id}
                </option>
              ))}
              {!((models || []).some((m) => m.id === model)) && model && (
                <option value={model} className="bg-[#16161a]">{model}</option>
              )}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs text-zinc-300 mb-1.5">System prompt (บุคลิกและคำสั่งของ bot)</span>
            <textarea
              rows={7}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-black/25 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-100 font-mono leading-relaxed resize-y transition focus:outline-none focus:border-[rgba(10,132,255,0.55)] focus:shadow-[0_0_0_3px_rgba(10,132,255,0.14)]"
            />
          </label>

          {error && <p role="alert" className="text-[11px] text-red-300">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs text-zinc-300 glass-hover border border-white/10">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} className="btn-accent rounded-xl px-5 py-2.5 text-xs font-medium">
              {saving ? 'กำลังบันทึก…' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
