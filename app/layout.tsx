import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'DEVFORGE — From Real Problems to Secure Software',
  description: 'Autonomous developer platform: discover real software problems from GitHub and Hacker News, architect solutions via multi-provider AI gateway, and audit repositories with live OSV security scans.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-gray-200 min-h-screen antialiased selection:bg-cyber-green selection:text-black">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 ml-64 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
