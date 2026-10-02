import './globals.css';

export const metadata = {
  title: 'Dots by Pao — Personal AI Agent Workspace',
  description: 'A self-hosted personal AI agent workspace by Pao, built on the open-source Open Dots project (MIT). Chat, connectors, computer tasks, and approval-gated actions.',
  openGraph: {
    title: 'Dots by Pao — Personal AI Agent Workspace',
    description: 'Self-hostable AI chat, connectors, computer tasks, and approval-gated actions. Forked from Open Dots (MIT).',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body className="bg-background text-foreground antialiased select-none" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
