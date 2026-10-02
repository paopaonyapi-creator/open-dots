'use client';

import { useEffect, useState } from 'react';
import { AuthenticationError, ensureSession, login, logout } from '../lib/api';
import Dashboard from './Dashboard';

export default function AuthenticationGate() {
  const [phase, setPhase] = useState('loading');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const checkSession = async () => {
    setPhase('loading');
    setError('');
    try {
      await ensureSession();
      setPhase('authenticated');
    } catch (failure) {
      setPhase(failure instanceof AuthenticationError ? 'login' : 'unavailable');
      if (!(failure instanceof AuthenticationError)) setError('Cannot reach the API. Start the server and retry.');
    }
  };

  useEffect(() => {
    checkSession();
    const expired = () => { setToken(''); setError(''); setPhase('login'); };
    window.addEventListener('open-dots:authentication-required', expired);
    return () => window.removeEventListener('open-dots:authentication-required', expired);
  }, []);

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const credential = token;
    setToken('');
    try {
      await login(credential);
      setPhase('authenticated');
    } catch (failure) {
      setError(failure.message || 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    try { await logout(); }
    catch (failure) { setError(failure.message); setPhase('unavailable'); }
  };

  if (phase === 'authenticated') return <Dashboard onLogout={signOut} />;
  return (
    <main className="min-h-screen text-zinc-100 flex items-center justify-center p-6">
      <section className="w-full max-w-md liquid-glass rounded-3xl p-8 space-y-6 animate-rise-in">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl btn-accent flex items-center justify-center text-2xl select-none">
            ◉
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dots by Pao</h1>
            <p className="text-xs text-zinc-400 mt-1">Personal AI agent workspace · forked from Open Dots</p>
          </div>
        </div>
        {phase === 'loading' ? <p role="status" className="text-sm text-zinc-400 text-center">Checking session…</p> : phase === 'unavailable' ? <>
          <p role="alert" className="text-sm text-red-300 text-center">{error}</p>
          <button onClick={checkSession} className="btn-accent w-full rounded-xl px-4 py-2.5 text-sm font-medium">Retry connection</button>
        </> : <form onSubmit={signIn} className="space-y-4">
          <p className="text-sm text-zinc-400 leading-relaxed">Enter the owner token configured on your server. For a local installation, read the .auth-token file in your data directory (normally <code className="text-cyan-300 font-mono text-[11px]">~/.open-dots</code>).</p>
          <label htmlFor="owner-token" className="block text-sm text-zinc-300">Owner token</label>
          <input id="owner-token" type="password" autoComplete="off" required maxLength={4096} value={token} onChange={(event) => setToken(event.target.value)} disabled={busy} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition focus:outline-none focus:border-[rgba(10,132,255,0.55)] focus:shadow-[0_0_0_4px_rgba(10,132,255,0.14)]" placeholder="Paste your owner token" />
          <p className="text-xs text-zinc-500">Your model provider key is configured after signing in.</p>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <button disabled={busy} type="submit" className="btn-accent w-full rounded-xl px-4 py-2.5 text-sm font-medium">{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>}
      </section>
    </main>
  );
}
