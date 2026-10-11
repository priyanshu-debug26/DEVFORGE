'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Cpu, 
  ShieldCheck, 
  FolderKanban, 
  LayoutDashboard, 
  Sparkles,
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react';

const NAV_ITEMS = [
  { 
    name: 'Dashboard', 
    href: '/overview', 
    icon: LayoutDashboard,
    hint: 'Overview & metrics'
  },
  { 
    name: 'Find Problems', 
    href: '/discover', 
    icon: Compass, 
    badge: 'Real Issues',
    hint: 'GitHub & Hacker News'
  },
  { 
    name: 'AI Architect', 
    href: '/ai-gateway', 
    icon: Cpu, 
    badge: 'Multi-LLM',
    hint: 'Gemini & Groq gateway'
  },
  { 
    name: 'Security Audit', 
    href: '/security', 
    icon: ShieldCheck, 
    badge: 'OSV Live',
    hint: 'Scan repo vulnerabilities'
  },
  { 
    name: 'My Projects', 
    href: '/projects', 
    icon: FolderKanban,
    hint: 'Track ideas to launch'
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0b0f17] flex flex-col h-screen fixed left-0 top-0 z-30 select-none shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5">
        <Link href="/overview" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-green/20 via-surface to-cyber-cyan/10 flex items-center justify-center border border-cyber-green/30 group-hover:border-cyber-green group-hover:shadow-neon transition-all duration-300">
            <Sparkles className="w-5 h-5 text-cyber-green group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wide text-base text-white group-hover:text-cyber-green transition-colors">
                DEVFORGE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyber-green/15 text-cyber-green border border-cyber-green/30 font-semibold">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans tracking-tight">
              Real problems → Secure software
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-500 font-semibold">
          Main Menu
        </div>
        
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/overview' && pathname === '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-cyber-green/15 text-white border border-cyber-green/40 shadow-neon'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyber-green' : 'text-gray-400 group-hover:text-cyber-green'}`} />
                <div className="text-left">
                  <div className="leading-tight text-[13px]">{item.name}</div>
                  <div className="text-[10px] text-gray-400 font-normal leading-tight hidden lg:block">
                    {item.hint}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  isActive 
                    ? 'bg-cyber-green/20 text-cyber-green font-semibold' 
                    : 'bg-white/5 text-gray-400 group-hover:text-gray-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Guided Step Banner */}
        <div className="pt-6 px-2">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-surface to-[#0a121d] border border-white/5 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-cyber-green font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              <span>How it works</span>
            </div>
            <ol className="text-[11px] text-gray-400 space-y-1 font-sans">
              <li className="flex items-center gap-1.5">
                <span className="text-cyber-green font-mono font-bold">1.</span> Find a real issue
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-cyber-cyan font-mono font-bold">2.</span> Plan with AI
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-rose-400 font-mono font-bold">3.</span> Audit repo security
              </li>
            </ol>
          </div>
        </div>
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-white/5 bg-[#090d14]">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyber-emerald" />
            <span className="text-[11px]">Local & Cloud Sync</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyber-green bg-cyber-green/10 px-1.5 py-0.5 rounded-md border border-cyber-green/20 font-semibold">
            Ready
          </span>
        </div>
        <p className="text-[10px] text-gray-400 leading-tight">
          All data auto-saved locally
        </p>
      </div>
    </aside>
  );
}
