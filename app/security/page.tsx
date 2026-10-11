'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  Package, 
  Key, 
  Container, 
  Code,
  ChevronDown,
  ChevronUp,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { SecurityScanResult, SecurityFinding, VulnerabilitySeverity } from '@/lib/types';

export default function SecurityPage() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/expressjs/express');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentScan, setCurrentScan] = useState<SecurityScanResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeSeverity, setActiveSeverity] = useState<string>('ALL');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  const fetchPastScans = async () => {
    try {
      const res = await fetch('/api/security/scan');
      if (res.ok) {
        const data = await res.json();
        if (data.scans && data.scans.length > 0 && !currentScan) {
          setCurrentScan(data.scans[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load past scans", err);
    }
  };

  useEffect(() => {
    fetchPastScans();
  }, []);

  const handleRunScan = async (urlToScan?: string) => {
    const targetUrl = urlToScan || repoUrl;
    if (!targetUrl.trim() || scanning) return;

    try {
      setScanning(true);
      setError(null);

      const res = await fetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: targetUrl.trim() })
      });

      const data = await res.json();

      if (data.success && data.scan) {
        setCurrentScan(data.scan);
        setActiveCategory('ALL');
        setActiveSeverity('ALL');
      } else {
        setError(data.error || 'Failed to complete security scan');
      }
    } catch (err: any) {
      setError(err.message || 'Security scanner execution failure');
    } finally {
      setScanning(false);
    }
  };

  const handleExportJson = () => {
    if (!currentScan) return;
    const blob = new Blob([JSON.stringify(currentScan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devforge-audit-${currentScan.owner}-${currentScan.repo}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const findings = currentScan?.findings || [];
  const filteredFindings = findings.filter(f => {
    if (activeSeverity !== 'ALL' && f.severity !== activeSeverity) return false;
    if (activeCategory !== 'ALL' && f.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyber-green" />
            <span>Repository Security Center</span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Audit any public GitHub repository against Google's live OSV vulnerability database, leaked credentials, and Dockerfile misconfigurations.
          </p>
        </div>

        {currentScan && (
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-xs font-semibold text-gray-200 border border-white/10 transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-cyber-green" />
            <span>Export Full Audit JSON</span>
          </button>
        )}
      </div>

      {/* Target Repo Input Form (Clean & Friendly) */}
      <div className="p-6 rounded-2xl bg-surface border border-white/5 space-y-4 shadow-cyber-card">
        <div>
          <label className="text-xs font-bold text-white block mb-1.5">
            Submit Public GitHub Repository URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">
                https://github.com/
              </span>
              <input
                type="text"
                placeholder="owner/repository (e.g. expressjs/express)"
                value={repoUrl.replace(/^https?:\/\/(?:www\.)?github\.com\//, '')}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setRepoUrl(val.startsWith('http') ? val : `https://github.com/${val}`);
                }}
                className="w-full pl-44 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green font-mono"
              />
            </div>

            <button
              onClick={() => handleRunScan()}
              disabled={scanning || !repoUrl.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyber-green text-black font-bold text-xs hover:bg-cyber-green/90 transition-all shadow-neon disabled:opacity-50 shrink-0"
            >
              <Play className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Auditing Codebase...' : 'Scan Repository →'}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Popular Repos */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-gray-400 text-[11px] font-medium">Or try popular open-source projects:</span>
          {[
            { label: 'expressjs/express', url: 'https://github.com/expressjs/express' },
            { label: 'pallets/flask', url: 'https://github.com/pallets/flask' },
            { label: 'torvalds/linux', url: 'https://github.com/torvalds/linux' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setRepoUrl(item.url);
                handleRunScan(item.url);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-gray-300 hover:text-white border border-white/5 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Active Scan Results */}
      {currentScan && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Executive Posture Card */}
          <div className="p-6 rounded-2xl bg-surface border border-white/5 shadow-cyber-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Score Display */}
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border font-mono shadow-xl shrink-0 ${
                  currentScan.executiveScore >= 80 
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : currentScan.executiveScore >= 60
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                }`}>
                  <span className="text-3xl font-extrabold">{currentScan.securityGrade}</span>
                  <span className="text-[10px] uppercase font-sans font-semibold text-gray-400">Grade</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">
                      {currentScan.owner}/{currentScan.repo}
                    </h2>
                    <a
                      href={currentScan.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <p className="text-xs text-gray-300 mt-1">
                    Audited <strong>{currentScan.dependenciesAudited} dependencies</strong> across manifest files in {currentScan.scanDurationMs}ms.
                  </p>

                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                    <span>Executive Score:</span>
                    <strong className="text-white font-mono text-sm">{currentScan.executiveScore}/100</strong>
                    <span className="text-gray-600">•</span>
                    <span>Status:</span>
                    <span className="text-cyber-green font-semibold">
                      {currentScan.totalFindings === 0 ? 'No Critical Vulnerabilities' : `${currentScan.totalFindings} Issues Identified`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Severity Breakdown Counter Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block">Critical</span>
                  <span className="text-xl font-bold font-mono text-rose-400">
                    {currentScan.severityBreakdown.critical}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">High</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {currentScan.severityBreakdown.high}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                  <span className="text-[10px] font-mono text-yellow-300 uppercase font-bold block">Medium</span>
                  <span className="text-xl font-bold font-mono text-yellow-300">
                    {currentScan.severityBreakdown.medium}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                  <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold block">Low</span>
                  <span className="text-xl font-bold font-mono text-cyan-300">
                    {currentScan.severityBreakdown.low}
                  </span>
                </div>
              </div>
            </div>

            {/* Scanner Status Strip */}
            <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { name: 'OSV.dev DB', desc: 'Dependencies' },
                { name: 'Gitleaks Engine', desc: 'Secrets Scanner' },
                { name: 'Dockerfile Linter', desc: 'Container Safety' },
                { name: 'API Heuristics', desc: 'Code Patterns' }
              ].map((s, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white text-[11px] block">{s.name}</span>
                    <span className="text-[10px] text-gray-400">{s.desc}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-cyber-green" />
                </div>
              ))}
            </div>
          </div>

          {/* User-Friendly Category Tabs & Severity Filter */}
          <div className="p-4 rounded-2xl bg-surface border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-gray-400 font-medium mr-1">Category:</span>
              {[
                { id: 'ALL', label: `All (${findings.length})` },
                { id: 'dependency', label: `Dependencies (${findings.filter(f => f.category === 'dependency').length})` },
                { id: 'secret', label: `Secrets (${findings.filter(f => f.category === 'secret').length})` },
                { id: 'dockerfile', label: `Dockerfile (${findings.filter(f => f.category === 'dockerfile').length})` },
                { id: 'heuristic_api', label: `API Flaws (${findings.filter(f => f.category === 'heuristic_api').length})` },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-cyber-green text-black font-bold'
                      : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Severity Pill Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 font-medium mr-1">Severity:</span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setActiveSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition-colors ${
                    activeSeverity === sev
                      ? 'bg-rose-500 text-white font-bold'
                      : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Findings List (Clear & Friendly) */}
          {filteredFindings.length === 0 ? (
            <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-cyber-green mx-auto" />
              <h3 className="text-sm font-bold text-white">No security findings in this category</h3>
              <p className="text-xs text-gray-400">
                All audited code files and dependencies passed the selected checks.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFindings.map((finding) => {
                const isExpanded = expandedFinding === finding.id;

                return (
                  <div
                    key={finding.id}
                    className="p-5 rounded-2xl bg-surface border border-white/5 hover:border-white/20 transition-all space-y-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge severity={finding.severity} />
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/40 text-gray-300 border border-white/5">
                            {finding.scanner}
                          </span>
                          <span className="text-xs font-mono font-bold text-cyber-cyan">
                            {finding.affectedTarget}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white pt-1">
                          {finding.title}
                        </h3>

                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          {finding.description}
                        </p>
                      </div>

                      <button
                        onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* How to Fix Remediation Box */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-surface to-surface border border-emerald-500/20 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-cyber-green font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>How to Remediate:</span>
                      </div>
                      <p className="text-xs text-gray-200 font-sans leading-relaxed">
                        {finding.remediation}
                      </p>

                      {finding.evidence && (
                        <div className="pt-1">
                          <span className="text-[10px] font-mono text-gray-400 block mb-0.5">Evidence:</span>
                          <code className="text-[11px] font-mono text-rose-300 bg-black/40 px-2 py-1 rounded block overflow-x-auto border border-white/5">
                            {finding.evidence}
                          </code>
                        </div>
                      )}

                      {finding.advisoryUrl && (
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-gray-400 font-mono text-[10px]">Reference: {finding.cveReference || 'OSV'}</span>
                          <a
                            href={finding.advisoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyber-green hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <span>Read Official Advisory</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
