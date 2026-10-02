'use client';

import React, { useState } from 'react';
import { FiSearch, FiPlus, FiSettings, FiActivity, FiLogOut, FiMoreHorizontal, FiEdit2, FiTrash2 } from 'react-icons/fi';
import MascotAvatar from './MascotAvatar';

function BotAvatar({ bot }) {
  const emoji = (bot?.originalBot?.avatar || '').trim();
  if (emoji) {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 select-none border border-white/10 shadow-inner"
        style={{ background: `${bot.originalBot?.accent_color || '#3b82f6'}26` }}
        aria-hidden="true"
      >
        {emoji}
      </div>
    );
  }
  return <MascotAvatar type={bot.avatarType} size="md" />;
}

export default function Sidebar({
  onLogout,
  bots,
  activeBotId,
  userName,
  onSelectBot,
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenNewBot,
  onRenameBot,
  onDeleteBot
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuBotId, setMenuBotId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  // userName comes from Dashboard (synced with AppSettingsDrawer in real-time)
  const displayName = userName || 'You';

  const closeMenus = () => {
    setMenuBotId(null);
    setConfirmDeleteId(null);
  };

  const displayBots = (bots || []).map((b) => ({
    id: b.id,
    name: b.name,
    subtitle: b.role || b.description || 'General Intelligence',
    avatarType: b.isError ? 'warning' : 'blue',
    time: b.created_at ? new Date(b.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
    isError: !!b.isError,
    originalBot: b,
  }));

  const filteredBots = displayBots.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const submitRename = (botId) => {
    const value = renameValue;
    setRenamingId(null);
    setRenameValue('');
    if (onRenameBot) onRenameBot(botId, value);
  };

  return (
    <aside className="w-72 h-screen dark-sidebar flex flex-col justify-between select-none flex-shrink-0 text-zinc-300 font-sans relative">
      {/* Click-away backdrop for the per-bot menu */}
      {menuBotId && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeMenus}
          aria-hidden="true"
        />
      )}

      {/* Top Header & Search Area */}
      <div className="p-3.5 space-y-3">
        {/* Traffic Light Dots & Plus Button Header */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] block border border-[#e0443e]/40 cursor-pointer hover:opacity-80 transition" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e] block border border-[#d8a025]/40 cursor-pointer hover:opacity-80 transition" />
            <span className="w-3 h-3 rounded-full bg-[#28c840] block border border-[#1fa031]/40 cursor-pointer hover:opacity-80 transition" />
          </div>

          <button
            suppressHydrationWarning={true}
            onClick={onOpenNewBot}
            title="Create New Bot"
            className="text-zinc-400 hover:text-white transition p-1 rounded-md glass-hover"
          >
            <FiPlus className="text-lg" />
          </button>
        </div>

        {/* Brand */}
        <div className="px-1 pt-0.5">
          <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
            Dots <span className="text-[rgba(10,132,255,0.9)]">by Pao</span>
          </h1>
        </div>

        {/* Rounded Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-zinc-500 text-xs" />
          <input
            suppressHydrationWarning={true}
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/25 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)] focus:shadow-[0_0_0_3px_rgba(10,132,255,0.14)]"
          />
        </div>
      </div>

      {/* Bot Roster List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1.5">
        {filteredBots.length === 0 ? (
          <div className="mt-10 mx-3 rounded-2xl border border-dashed border-white/12 p-5 text-center animate-fade-in">
            <div className="text-2xl mb-2 select-none">✦</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {displayBots.length === 0
                ? 'ยังไม่มี bot — กดปุ่ม + เพื่อสร้าง assistant แรกของคุณ'
                : 'ไม่พบ bot ที่ค้นหา'}
            </p>
            {displayBots.length === 0 && (
              <button
                onClick={onOpenNewBot}
                className="btn-accent mt-3 rounded-lg px-3 py-1.5 text-[11px] font-medium"
              >
                New Bot
              </button>
            )}
          </div>
        ) : (
          filteredBots.map((botItem) => {
            const isActive = activeBotId === botItem.id || (activeBotId === '' && botItem.id === displayBots[0]?.id);
            const isRenaming = renamingId === botItem.id;
            const isConfirmingDelete = confirmDeleteId === botItem.id;

            return (
              <div
                key={botItem.id}
                onClick={() => !isConfirmingDelete && onSelectBot(botItem.id)}
                className={`group relative p-2.5 rounded-2xl cursor-pointer flex items-start gap-3 glass-row ${
                  isActive ? 'glass-row-active text-white' : 'text-zinc-400'
                }`}
              >
                {isConfirmingDelete ? (
                  /* Two-step delete confirmation, inline in the row */
                  <div className="flex-1 min-w-0 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <p className="text-[11px] text-zinc-100 font-medium truncate">
                      ลบ “{botItem.name}” ?
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">ประวัติแชทของ bot นี้จะไม่ถูกลบ</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        onClick={() => { onDeleteBot && onDeleteBot(botItem.id); closeMenus(); }}
                        className="rounded-md bg-rose-600/90 hover:bg-rose-600 px-2.5 py-1 text-[10px] font-semibold text-white transition"
                      >
                        ลบเลย
                      </button>
                      <button
                        onClick={closeMenus}
                        className="rounded-md px-2.5 py-1 text-[10px] text-zinc-300 hover:bg-white/10 transition"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <BotAvatar bot={botItem} />

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-1">
                        {isRenaming ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') submitRename(botItem.id);
                              if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                            }}
                            onBlur={() => submitRename(botItem.id)}
                            maxLength={80}
                            className="w-full bg-black/30 border border-[rgba(10,132,255,0.55)] rounded-md px-1.5 py-0.5 text-xs text-zinc-100 focus:outline-none"
                          />
                        ) : (
                          <h3 className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-200'}`}>
                            {botItem.name}
                          </h3>
                        )}
                        {!isRenaming && botItem.time && (
                          <span className="text-[10px] text-zinc-500 font-normal flex-shrink-0">
                            {botItem.time}
                          </span>
                        )}
                      </div>

                      {!isRenaming && (
                        <p className="text-[11px] truncate mt-0.5 text-zinc-400 group-hover:text-zinc-300">
                          {botItem.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Per-bot options menu */}
                    <button
                      suppressHydrationWarning={true}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuBotId(menuBotId === botItem.id ? null : botItem.id);
                        setConfirmDeleteId(null);
                      }}
                      title="Bot options"
                      className={`absolute top-1 right-1 p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/10 transition ${
                        menuBotId === botItem.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <FiMoreHorizontal className="text-sm" />
                    </button>

                    {menuBotId === botItem.id && (
                      <div
                        className="absolute right-1 top-7 z-50 w-36 dark-popover rounded-xl p-1 animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setRenamingId(botItem.id);
                            setRenameValue(botItem.originalBot.name || '');
                            setMenuBotId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-zinc-200 hover:bg-white/10 transition"
                        >
                          <FiEdit2 className="text-xs" /> เปลี่ยนชื่อ
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDeleteId(botItem.id);
                            setMenuBotId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-rose-300 hover:bg-rose-500/15 transition"
                        >
                          <FiTrash2 className="text-xs" /> ลบ bot
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sidebar Footer */}
      <div className="p-3 space-y-2 border-t border-white/8">
        {/* Plugins Section */}
        <button
          suppressHydrationWarning={true}
          onClick={() => onSelectTab && onSelectTab('marketplace')}
          className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium transition glass-row ${
            activeTab === 'marketplace' ? 'glass-row-active text-white' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <span className="text-sm">🧩</span>
          <span>Plugins</span>
        </button>

        <button
          suppressHydrationWarning={true}
          onClick={() => onSelectTab && onSelectTab('audit')}
          className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium transition glass-row ${
            activeTab === 'audit' ? 'glass-row-active text-white' : 'text-zinc-300 hover:text-white'
          }`}
        >
          <FiActivity className="text-sm text-cyan-400" />
          <span>Audit trail</span>
        </button>

        <button onClick={onLogout} className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs text-zinc-300 hover:text-white glass-row">
          <FiLogOut /> Sign out
        </button>

        {/* You Profile Row */}
        <div className="flex items-center justify-between pt-1">
          <button
            suppressHydrationWarning={true}
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition"
          >
            <div className="w-5 h-5 rounded-full btn-accent flex items-center justify-center text-[10px] font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span>{displayName}</span>
          </button>

          <button
            suppressHydrationWarning={true}
            onClick={onOpenSettings}
            className="p-2 text-zinc-400 hover:text-zinc-200 glass-hover rounded-lg transition"
            title="Settings"
          >
            <FiSettings className="text-sm" />
          </button>
        </div>
      </div>
    </aside>
  );
}
