'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Cpu, 
  ShieldAlert, 
  FolderKanban, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { LifecycleFlow } from '@/components/LifecycleFlow';
import { SystemStats, Project } from '@/lib/types';

export default function OverviewPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [resStats, resProj] = await Promise.all([
        fetch('/api/system/stats'),
        fetch('/api/projects')
      ]);

      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data.stats);
      }
      if (resProj.ok) {
        const data = await resProj.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface via-[#101724] to-surface border border-white/5 p-8 shadow-cyber-card">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-green/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping" />
            <span>Developer Acceleration Platform</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Build software that matters. <span className="text-cyber-green">Ship with confidence.</span>
          </h1>
          <p className="mt-2 text-sm text-gray-300 leading-relaxed font-sans">
            DEVFORGE pulls real software problems from GitHub and Hacker News, generates production blueprints with multi-provider AI, and scans your code against Google's live OSV vulnerability database.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyber-green text-black font-bold text-xs tracking-wide hover:bg-cyber-green/90 transition-all shadow-neon"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Real Problems</span>
            </Link>

            <Link
              href="/security"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Audit a GitHub Repo</span>
            </Link>

            <Link
              href="/ai-gateway"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all"
            >
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              <span>Try AI Architect</span>
            </Link>
          </div>
        </div>
      </div>

      {/* The 4-Step Engineering Journey */}
      <LifecycleFlow />

      {/* Simplified, Clean KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-surface border border-white/5 hover:border-cyber-green/30 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium text-gray-400">Problems Discovered</span>
            <Compass className="w-4 h-4 text-cyber-green" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {stats ? stats.problemsDiscovered : '--'}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Mined from GitHub & HN
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-surface border border-white/5 hover:border-cyber-cyan/30 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium text-gray-400">AI Gateway Speed</span>
            <Cpu className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {stats ? `${stats.averageGatewayLatencyMs}ms` : '--'}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Auto-routing with failover
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-surface border border-white/5 hover:border-rose-400/30 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium text-gray-400">Security Audits</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {stats ? stats.totalScans : '--'}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {stats?.vulnerabilitiesFound || 0} vulnerabilities detected
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-surface border border-white/5 hover:border-amber-400/30 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium text-gray-400">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {stats ? stats.projectsCount : '--'}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Auto-saved in local database
          </p>
        </div>
      </div>

      {/* Projects & AI Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Project Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-amber-400" />
                <span>Your Projects</span>
              </h2>
              <p className="text-xs text-gray-400">
                Connected problem, AI blueprint, and security scan in one place
              </p>
            </div>
            
            <Link
              href="/projects"
              className="text-xs text-cyber-green hover:underline flex items-center gap-1 font-semibold"
            >
              <span>See All Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="block p-5 rounded-2xl bg-surface border border-white/5 hover:border-cyber-green/40 hover:bg-[#121926] transition-all group shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold bg-cyber-green/10 text-cyber-green border border-cyber-green/20">
                        {proj.stage.replace('_', ' ')}
                      </span>
                      {proj.latestScan && (
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          proj.latestScan.executiveScore >= 80 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          Security Grade: {proj.latestScan.securityGrade} ({proj.latestScan.executiveScore}/100)
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyber-green transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-cyber-green transition-colors shrink-0" />
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {proj.techStack.slice(0, 3).map((stk) => (
                      <span key={stk} className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-gray-300 border border-white/5">
                        {stk}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] font-semibold text-cyber-green group-hover:underline">
                    Open Workspace →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): AI Providers & Quick Tips */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              <span>AI Provider Status</span>
            </h2>
            <p className="text-xs text-gray-400">
              Gateway health & automatic routing
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-3">
            {stats?.providerStatuses.map((p) => (
              <div
                key={p.provider}
                className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      p.status === 'online' ? 'bg-cyber-green' : 'bg-gray-500'
                    }`} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                    {p.model}
                  </span>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                  p.status === 'online'
                    ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20'
                    : 'bg-white/5 text-gray-400 border border-white/5'
                }`}>
                  {p.configured ? 'Configured' : 'Simulated'}
                </span>
              </div>
            ))}
          </div>

          {/* Friendly Tip Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyber-green/10 via-surface to-surface border border-cyber-green/20 space-y-2">
            <div className="flex items-center gap-2 text-cyber-green text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Pro Tip for Hackathon Demo</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Head to <strong>AI Architect</strong> and flip the <em>"Simulate Primary Rate Limit"</em> switch. You can watch DEVFORGE automatically failover live with full timing telemetry!
            </p>
            <Link
              href="/ai-gateway"
              className="inline-flex items-center gap-1 text-xs text-cyber-green font-bold hover:underline pt-1"
            >
              <span>Test Failover Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
