'use client';

import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2, FiBrain } from 'react-icons/fi';

const MAX_MEMORY = 50;

export default function MemoryModal({ bot, onClose, onSave }) {
  const [items, setItems] = useState([...(bot?.memory || [])]);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!bot) return null;

  const add = () => {
    const fact = draft.trim();
    if (!fact) return;
    if (items.some((x) => x === fact)) {
      setError('มีข้อความนี้ในความจำอยู่แล้ว');
      return;
    }
    setError('');
    setItems([...items, fact].slice(-MAX_MEMORY));
    setDraft('');
  };

  const removeAt = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave(bot.id, items);
      onClose();
    } catch (err) {
      setError(err.message || 'บันทึกความจำไม่สำเร็จ');
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
        className="w-full max-w-lg max-h-[85vh] flex flex-col liquid-glass-strong rounded-3xl p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl btn-accent flex items-center justify-center text-base">
              <FiBrain />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">ความจำระยะยาว</h2>
              <p className="text-[11px] text-zinc-400">{bot.name} · จำได้ตลอด แม้กด New chat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-white glass-hover" aria-label="Close">
            <FiX />
          </button>
        </div>

        {/* Add input */}
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={draft}
            maxLength={200}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="เช่น ฉันชอบกาแฟดอยเชียงใหม่"
            className="flex-1 bg-black/25 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)] focus:shadow-[0_0_0_3px_rgba(10,132,255,0.14)]"
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className="btn-accent rounded-xl px-3.5 py-2.5 text-xs font-medium flex items-center gap-1.5 disabled:opacity-40"
          >
            <FiPlus /> จำ
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/12 p-6 text-center animate-fade-in">
              <div className="text-2xl mb-2 select-none">🧠</div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                ยังไม่มีความจำ — พิมพ์ข้อความที่อยากให้จำ หรือพิมพ์ <code className="text-cyan-300 font-mono">/remember</code> ในแชท
              </p>
            </div>
          ) : (
            items.map((fact, index) => (
              <div key={`${fact}-${index}`} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <span className="text-[10px] font-mono text-[rgba(10,132,255,0.9)] mt-0.5 flex-shrink-0">{index + 1}.</span>
                <p className="flex-1 text-[11px] text-zinc-200 leading-relaxed break-words">{fact}</p>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="p-1 rounded-md text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 transition flex-shrink-0"
                  title="ลบข้อความนี้"
                >
                  <FiTrash2 className="text-xs" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-white/8 space-y-2">
          {error && <p role="alert" className="text-[11px] text-red-300">{error}</p>}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-zinc-500">{items.length}/{MAX_MEMORY} ความจำ</span>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="rounded-xl px-3 py-2 text-[11px] text-rose-300 glass-hover border border-rose-500/25"
                >
                  ล้างทั้งหมด
                </button>
              )}
              <button type="button" onClick={onClose} className="rounded-xl px-3.5 py-2 text-xs text-zinc-300 glass-hover border border-white/10">
                ยกเลิก
              </button>
              <button type="button" onClick={save} disabled={saving} className="btn-accent rounded-xl px-4 py-2 text-xs font-medium">
                {saving ? 'กำลังบันทึก…' : 'บันทึก'}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-600">
            ทางลัดในแชท: <code className="text-cyan-300 font-mono">/remember</code> เพื่อจำ · <code className="text-cyan-300 font-mono">/forget</code> เพื่อล้าง
          </p>
        </div>
      </div>
    </div>
  );
}
