'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Cpu, ShieldAlert, FolderKanban, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LifecycleFlowProps {
  activeStep?: 'discover' | 'build' | 'protect' | 'monitor';
}

export function LifecycleFlow({ activeStep }: LifecycleFlowProps) {
  const steps = [
    {
      id: 'discover',
      stepNum: '1',
      title: 'Find a Real Problem',
      subtitle: 'Browse live developer pain points from GitHub & Hacker News',
      icon: Compass,
      href: '/discover',
      tag: 'GitHub & HN',
      badgeColor: 'text-cyber-green bg-cyber-green/10 border-cyber-green/30',
      hoverBorder: 'hover:border-cyber-green/50',
    },
    {
      id: 'build',
      stepNum: '2',
      title: 'Architect with AI',
      subtitle: 'Create technical specs and milestones via multi-model AI Gateway',
      icon: Cpu,
      href: '/ai-gateway',
      tag: 'Gemini + Groq',
      badgeColor: 'text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30',
      hoverBorder: 'hover:border-cyber-cyan/50',
    },
    {
      id: 'protect',
      stepNum: '3',
      title: 'Scan for Security Flaws',
      subtitle: 'Audit code against live OSV CVEs, leaked secrets & container bugs',
      icon: ShieldAlert,
      href: '/security',
      tag: 'Live OSV Scan',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      hoverBorder: 'hover:border-rose-500/50',
    },
    {
      id: 'monitor',
      stepNum: '4',
      title: 'Launch & Track Project',
      subtitle: 'Consolidate the original issue, AI blueprint, and security grade',
      icon: FolderKanban,
      href: '/projects',
      tag: 'Unified Workspace',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      hoverBorder: 'hover:border-amber-500/50',
    }
  ];

  return (
    <div className="w-full bg-surface/60 border border-white/5 rounded-2xl p-6 shadow-cyber-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-green font-bold">
              The 4-Step Engineering Journey
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Turn real developer pain into secure, production-ready software
          </h2>
        </div>
        <p className="text-xs text-gray-400 font-sans">
          Click any step to jump straight in
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCurrent = activeStep === step.id;

          return (
            <Link
              key={step.id}
              href={step.href}
              className={`p-5 rounded-xl bg-surface/90 border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                isCurrent
                  ? 'border-cyber-green bg-cyber-green/[0.08] shadow-neon'
                  : `border-white/5 ${step.hoverBorder} hover:bg-surface hover:-translate-y-0.5`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold ${step.badgeColor}`}>
                    Step {step.stepNum}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 text-white group-hover:text-cyber-green transition-colors" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyber-green transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-sans">
                  {step.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 group-hover:text-white">
                <span className="text-[11px] font-mono text-gray-400">{step.tag}</span>
                <span className="text-[11px] font-semibold text-cyber-green flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Start →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
