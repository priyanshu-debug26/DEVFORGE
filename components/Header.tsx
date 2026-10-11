'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Key, ShieldCheck, Cpu, Database, Sparkles } from 'lucide-react';
import { ApiKeyModal } from './ApiKeyModal';
import { getClientUserKeys, countActiveUserKeys } from '@/lib/clientKeys';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Welcome to DEVFORGE', subtitle: 'Turn real developer problems into secure, verified software' },
  '/overview': { title: 'Welcome to DEVFORGE', subtitle: 'Turn real developer problems into secure, verified software' },
  '/discover': { title: 'Problem Discovery', subtitle: 'Search real bugs & feature requests from GitHub and Hacker News' },
  '/ai-gateway': { title: 'AI Architect Studio', subtitle: 'Generate technical blueprints with Gemini & Groq auto-routing' },
  '/security': { title: 'Security Center', subtitle: 'Scan public GitHub repositories against the live OSV vulnerability database' },
  '/projects': { title: 'Project Workspaces', subtitle: 'Manage your projects from discovery through security audits' },
};

export function Header() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeKeysCount, setActiveKeysCount] = useState(0);

  const checkKeys = () => {
    const keys = getClientUserKeys();
    setActiveKeysCount(countActiveUserKeys(keys));
  };

  useEffect(() => {
    checkKeys();
    window.addEventListener('devforge_keys_updated', checkKeys);
    return () => window.removeEventListener('devforge_keys_updated', checkKeys);
  }, []);

  let current = TITLES[pathname];
  if (!current) {
    if (pathname.startsWith('/projects/')) {
      current = { title: 'Project Command Center', subtitle: 'Unified view: Problem Context → AI Blueprint → Security Posture' };
    } else {
      current = { title: 'DEVFORGE', subtitle: 'From real problems to secure software' };
    }
  }

  return (
    <>
      <header className="h-16 border-b border-white/5 bg-[#0a0e16]/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">
            {current.title}
          </h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-white/5 text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-cyber-green" />
            <span className="text-[11px] text-gray-400">OSV Database:</span>
            <span className="text-white text-[11px] font-semibold">Active</span>
          </div>

          {/* BYOK Status Button */}
          <button
            onClick={() => setModalOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              activeKeysCount > 0
                ? 'bg-cyber-green/15 text-cyber-green border-cyber-green/40 shadow-neon'
                : 'bg-white/5 hover:bg-white/10 text-gray-200 border-white/10 hover:border-cyber-green/30'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-cyber-green" />
            <span>{activeKeysCount > 0 ? `My Keys Active (${activeKeysCount})` : 'Bring Your Keys'}</span>
          </button>
        </div>
      </header>

      {modalOpen && <ApiKeyModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
