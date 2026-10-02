import Link from 'next/link';

const alternatives = [
  ['openai-dots', 'OpenAI Dots'],
  ['meta-muse', 'Meta Muse'],
  ['grok-bot', 'Grok Bot'],
  ['instinct', 'Instinct'],
  ['manus-cue', 'Manus Cue'],
  ['openclaw', 'OpenClaw'],
  ['claude-cowork', 'Claude Cowork'],
  ['chatgpt-agent', 'ChatGPT agent'],
];

export default function Home() {
  return (
    <main className="min-h-screen text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-semibold">Dots <span className="text-[rgba(10,132,255,0.9)]">by Pao</span></Link>
        <nav className="flex items-center gap-5 text-sm text-zinc-300">
          <a href="https://github.com/paopaonyapi-creator/open-dots">GitHub</a>
          <Link href="/app" className="btn-accent rounded-lg px-4 py-2 font-medium">Open the app</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-[rgba(10,132,255,0.85)]">Self hosted · forked from Open Dots · MIT licensed</p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">Your personal AI agent workspace, running on your own machine</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">Dots by Pao is a customized fork of the MIT-licensed Open Dots workspace: streaming chat with assistant personas, live model discovery from any OpenAI Responses-compatible endpoint, connector actions, computer tasks, and approval-gated operations — restyled with an Apple Liquid Glass interface.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/app" className="btn-accent rounded-lg px-5 py-3 font-medium">Open Dots by Pao</Link>
          <a href="https://github.com/paopaonyapi-creator/open-dots" className="glass-hover rounded-lg border border-white/12 px-5 py-3 font-medium">View source on GitHub</a>
        </div>
        <p className="mt-4 text-sm text-zinc-500">Early prototype for local experimentation. Review the documented security and deployment limitations before hosting it for others.</p>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-950/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
          <article><h2 className="text-lg font-semibold">Self-hosted AI workspace</h2><p className="mt-2 leading-7 text-zinc-400">Conversation and app state use local SQLite storage. Provider credentials are encrypted at rest.</p></article>
          <article><h2 className="text-lg font-semibold">Visible action controls</h2><p className="mt-2 leading-7 text-zinc-400">A deny-by-default action gateway routes higher-risk operations through approval prompts and audit events.</p></article>
          <article><h2 className="text-lg font-semibold">Open implementation</h2><p className="mt-2 leading-7 text-zinc-400">MIT-licensed code, a configurable inference adapter, Composio connectors, and an optional Docker/Playwright computer runtime.</p></article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold">Compare Open Dots with personal AI agents</h2>
        <p className="mt-3 max-w-3xl leading-7 text-zinc-400">Looking for an open-source alternative to one of these products? Read the product-specific comparison, including what Open Dots does and does not currently replace.</p>
        <ul className="mt-7 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {alternatives.map(([slug, name]) => <li key={slug}><Link className="block rounded-xl border border-zinc-800 p-4 hover:border-violet-500" href={`/alternatives/${slug}`}>Open Dots vs {name}<span className="mt-1 block text-sm text-zinc-500">Open-source alternative overview →</span></Link></li>)}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="text-2xl font-semibold">What Open Dots can do today</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <p className="rounded-xl border border-zinc-800 p-5 leading-7 text-zinc-300">Create assistant personas, stream chats, attach images, select configured models, and connect supported apps through narrowly scoped actions.</p>
          <p className="rounded-xl border border-zinc-800 p-5 leading-7 text-zinc-300">Request workspace and computer operations through an action gateway. Use the optional computer provider in Docker or connect a compatible remote service.</p>
        </div>
        <p className="mt-5 max-w-4xl text-sm leading-6 text-zinc-500">Open Dots is independently built and is not affiliated with or endorsed by OpenAI, Meta, xAI, Instinct, or Manus. It does not currently include persistent long-term memory, scheduled routines, a mobile app, multi-user roles, or a hardened sandbox for arbitrary web content.</p>
      </section>
      <section className="border-y border-zinc-800 bg-zinc-950/60">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-semibold">Is Open Dots the right AI agent alternative for you?</h2>
          <p className="mt-4 max-w-4xl leading-7 text-zinc-300">Choose Open Dots if you are comfortable running software yourself and want to inspect an AI workspace with visible approval steps. It is not the best fit if you need a polished mobile assistant, persistent memory, scheduled work, broad everyday app access, or a managed computer that keeps running in the cloud.</p>
          <h2 className="mt-10 text-2xl font-semibold">Questions about this open-source AI agent</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-zinc-800 p-5"><h3 className="font-semibold">Can I self-host Open Dots?</h3><p className="mt-2 leading-7 text-zinc-300">Yes. The API and web client can be run on infrastructure you control. You’ll need to configure a compatible inference service and follow the setup and security notes in the README.</p></article>
            <article className="rounded-xl border border-zinc-800 p-5"><h3 className="font-semibold">Which AI models does Dots by Pao support?</h3><p className="mt-2 leading-7 text-zinc-300">Point it at any OpenAI Responses-compatible endpoint and the app discovers the available model list live from the provider. The legacy prediction-API contract remains available as an opt-in wire mode.</p></article>
            <article className="rounded-xl border border-zinc-800 p-5"><h3 className="font-semibold">Is Open Dots a replacement for these personal agents?</h3><p className="mt-2 leading-7 text-zinc-300">It is an open-source project to evaluate when self-hosting and inspecting the implementation matter. It is still a prototype and does not match the feature set or convenience of the managed products.</p></article>
            <article className="rounded-xl border border-zinc-800 p-5"><h3 className="font-semibold">Is Open Dots safe for unattended computer use?</h3><p className="mt-2 leading-7 text-zinc-300">The project routes higher-risk operations through approvals, but its optional computer runtime is not hardened for hostile websites. It is intended for local experimentation; review the limitations before deployment.</p></article>
          </div>
        </div>
      </section>
      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-sm text-zinc-500">Dots by Pao · built on <a className="hover:text-white" href="https://github.com/Anil-matcha/open-dots">Open Dots</a> (MIT) · <a className="hover:text-white" href="https://github.com/paopaonyapi-creator/open-dots">Fork source</a></footer>
    </main>
  );
}
