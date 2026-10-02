import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center text-zinc-100 font-sans p-6 text-center space-y-4">
      <h1 className="text-4xl font-extrabold text-[rgba(10,132,255,0.9)]">404</h1>
      <h2 className="text-lg font-bold text-zinc-200">Page Not Found</h2>
      <p className="text-xs text-zinc-400 max-w-sm">
        The requested agent route or thread does not exist.
      </p>
      <Link
        href="/"
        className="btn-accent px-4 py-2 rounded-xl text-xs font-semibold transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}


