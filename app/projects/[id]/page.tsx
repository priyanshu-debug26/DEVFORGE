'use client';

import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FolderKanban, 
  Compass, 
  Cpu, 
  ShieldAlert, 
  ExternalLink, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  Clock,
  Layers,
  FileCode,
  ShieldCheck,
  Check,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Project, ProjectLifecycleStage } from '@/lib/types';
import { getClientUserKeys } from '@/lib/clientKeys';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [scanningRepo, setScanningRepo] = useState(false);
  const [repoInput, setRepoInput] = useState('');
  const [activeTab, setActiveTab] = useState<'blueprint' | 'problem' | 'security'>('blueprint');

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        if (data.project?.repositoryUrl) {
          setRepoInput(data.project.repositoryUrl);
        }
      }
    } catch (err) {
      console.error("Failed to load project", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleGenerateBuildPlan = async () => {
    if (!project || generatingPlan) return;
    try {
      setGeneratingPlan(true);
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_build_plan', userKeys: getClientUserKeys() })
      });

      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch (err) {
      console.error("Build plan generation failed", err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleRunSecurityAudit = async () => {
    const targetUrl = repoInput || project?.repositoryUrl;
    if (!targetUrl || scanningRepo) return;

    try {
      setScanningRepo(true);
      // Run scan
      const scanRes = await fetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: targetUrl })
      });

      const scanData = await scanRes.json();
      if (scanData.success && scanData.scan) {
        // Update project with scan & repo
        const updateRes = await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repositoryUrl: targetUrl,
            latestScan: scanData.scan,
            stage: scanData.scan.executiveScore >= 80 ? 'secured' : 'audited'
          })
        });

        if (updateRes.ok) {
          const upd = await updateRes.json();
          setProject(upd.project);
        }
      }
    } catch (err) {
      console.error("Security scan failed", err);
    } finally {
      setScanningRepo(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/projects');
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleStageChange = async (newStage: ProjectLifecycleStage) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch (err) {
      console.error("Stage update failed", err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-gray-400">
        Loading project command center...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-base font-bold text-white">Project not found</h2>
        <Link href="/projects" className="text-xs text-cyber-green hover:underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  const STAGES: { id: ProjectLifecycleStage; label: string }[] = [
    { id: 'discovered', label: '1. Discovered' },
    { id: 'architected', label: '2. Architected' },
    { id: 'in_progress', label: '3. In Progress' },
    { id: 'audited', label: '4. Audited' },
    { id: 'secured', label: '5. Secured' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-2 rounded-xl bg-surface hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                {project.stage.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-mono text-gray-500">{project.id}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">{project.title}</h1>
          </div>
        </div>

        {/* Quick Scan Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete this project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {project.latestScan ? (
            <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${
              project.latestScan.executiveScore >= 80 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              Audit Grade: {project.latestScan.securityGrade} ({project.latestScan.executiveScore}/100)
            </span>
          ) : (
            <button
              onClick={() => setActiveTab('security')}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/30"
            >
              Run Security Audit →
            </button>
          )}
        </div>
      </div>

      {/* Interactive Lifecycle Stepper (User-Friendly Stage Progression) */}
      <div className="p-4 rounded-2xl bg-surface border border-white/5 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span className="font-semibold text-white">Project Lifecycle Progress:</span>
          <span className="text-[11px]">Click any stage to advance</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {STAGES.map((s, idx) => {
            const isCurrent = project.stage === s.id;
            const isPassed = STAGES.findIndex(x => x.id === project.stage) >= idx;

            return (
              <button
                key={s.id}
                onClick={() => handleStageChange(s.id)}
                className={`p-2 sm:p-2.5 rounded-xl text-center transition-all border ${
                  isCurrent
                    ? 'bg-cyber-green text-black font-bold border-cyber-green shadow-neon'
                    : isPassed
                    ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/30 font-semibold'
                    : 'bg-black/20 text-gray-500 border-white/5 hover:text-white'
                }`}
              >
                <div className="text-[10px] sm:text-xs truncate">{s.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace Tabs: 3 Pillars */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'blueprint'
              ? 'bg-cyber-cyan text-black shadow-neon'
              : 'bg-surface text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Build Blueprint</span>
          {project.buildPlan && <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-rose-500 text-white shadow-lg'
              : 'bg-surface text-gray-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Security Audit & Vulnerabilities</span>
          {project.latestScan && <span className="w-1.5 h-1.5 rounded-full bg-cyber-green" />}
        </button>

        <button
          onClick={() => setActiveTab('problem')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'problem'
              ? 'bg-cyber-green text-black shadow-neon'
              : 'bg-surface text-gray-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Discovered Problem Context</span>
        </button>
      </div>

      {/* Tab 1: AI Build Blueprint */}
      {activeTab === 'blueprint' && (
        <div className="p-6 rounded-2xl bg-surface border border-white/5 space-y-6 shadow-cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyber-cyan" />
                <span>AI Technical Specification & Milestones</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Multi-model engineering plan generated via DEVFORGE AI Gateway
              </p>
            </div>

            <button
              onClick={handleGenerateBuildPlan}
              disabled={generatingPlan}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-cyan text-black font-bold text-xs hover:bg-cyber-cyan/90 transition-all shadow-neon"
            >
              <Sparkles className={`w-3.5 h-3.5 ${generatingPlan ? 'animate-spin' : ''}`} />
              <span>{generatingPlan ? 'Generating...' : 'Regenerate Plan with AI'}</span>
            </button>
          </div>

          {project.buildPlan ? (
            <div className="space-y-6">
              {/* Architecture Summary */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold block">Executive Summary</span>
                <p className="text-xs text-gray-200 leading-relaxed font-sans">
                  {project.buildPlan.summary}
                </p>
                {project.buildPlan.architectureNotes && (
                  <div className="pt-3 border-t border-white/5">
                    <MarkdownRenderer content={project.buildPlan.architectureNotes} />
                  </div>
                )}
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
                  Implementation Milestones & Action Items
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {project.buildPlan.phases.map((ph, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyber-cyan font-bold">Phase 0{idx + 1}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold uppercase ${
                          ph.status === 'completed' ? 'bg-cyber-green/10 text-cyber-green' :
                          ph.status === 'in_progress' ? 'bg-amber-500/10 text-amber-300' : 'bg-white/5 text-gray-400'
                        }`}>
                          {ph.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">{ph.title}</h4>

                      <ul className="space-y-1.5 text-xs text-gray-300">
                        {ph.tasks.map((task, ti) => (
                          <li key={ti} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-cyber-green shrink-0 mt-0.5" />
                            <span className="leading-tight">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3 bg-black/20 rounded-xl border border-white/5">
              <Cpu className="w-10 h-10 text-cyber-cyan mx-auto" />
              <h3 className="text-sm font-bold text-white">No build blueprint generated yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Generate a structured architectural blueprint with phased deliverables and security boundaries.
              </p>
              <button
                onClick={handleGenerateBuildPlan}
                disabled={generatingPlan}
                className="px-5 py-2.5 rounded-xl bg-cyber-cyan text-black font-bold text-xs hover:bg-cyber-cyan/90 shadow-neon"
              >
                Generate Specification with AI →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Security Audit & Vulnerabilities */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-surface border border-white/5 space-y-6 shadow-cyber-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Repository Security & OSV Audit</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Audit dependency graph against Google's live OSV CVE database & Gitleaks secrets
              </p>
            </div>

            {project.latestScan && (
              <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border self-start sm:self-auto ${
                project.latestScan.executiveScore >= 80 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                Grade {project.latestScan.securityGrade} ({project.latestScan.executiveScore}/100)
              </span>
            )}
          </div>

          {/* Repo Input & Scan Button */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <label className="text-xs font-semibold text-white block">Connected GitHub Repository</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
              />
              <button
                onClick={handleRunSecurityAudit}
                disabled={scanningRepo || !repoInput.trim()}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg shrink-0 disabled:opacity-50"
              >
                {scanningRepo ? 'Auditing Codebase...' : 'Run Security Scan'}
              </button>
            </div>
          </div>

          {/* Audit Results */}
          {project.latestScan ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 block font-medium">Executive Score</span>
                  <span className="text-2xl font-bold font-mono text-white">
                    {project.latestScan.executiveScore}/100
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-center">
                  <span className="text-[10px] text-rose-400 block font-medium">Total Vulnerabilities</span>
                  <span className="text-2xl font-bold font-mono text-rose-400">
                    {project.latestScan.totalFindings}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 block font-medium">Dependencies Audited</span>
                  <span className="text-2xl font-bold font-mono text-white">
                    {project.latestScan.dependenciesAudited}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-center">
                  <span className="text-[10px] text-gray-400 block font-medium">Scan Time</span>
                  <span className="text-2xl font-bold font-mono text-cyber-green">
                    {project.latestScan.scanDurationMs}ms
                  </span>
                </div>
              </div>

              {/* Findings */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
                  Detected Security Findings & Remediation:
                </h3>
                {project.latestScan.findings.length === 0 ? (
                  <div className="p-8 rounded-xl bg-black/20 text-center text-xs text-cyber-green border border-cyber-green/20">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-1" />
                    All dependencies and manifest checks passed with 0 known CVEs!
                  </div>
                ) : (
                  project.latestScan.findings.map((f) => (
                    <div key={f.id} className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={f.severity} />
                          <span className="text-xs font-mono font-bold text-cyber-cyan">{f.affectedTarget}</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">{f.scanner}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white">{f.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">{f.description}</p>

                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                        <strong>Remediation:</strong> {f.remediation}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3 bg-black/20 rounded-xl border border-white/5">
              <ShieldAlert className="w-10 h-10 text-gray-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">No security scan performed yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Enter your GitHub repository above to audit dependencies against live OSV CVE records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Discovered Problem Context */}
      {activeTab === 'problem' && (
        <div className="p-6 rounded-2xl bg-surface border border-white/5 space-y-6 shadow-cyber-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyber-green" />
                <span>Original Problem Context</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                The authentic developer issue mined from public discussions
              </p>
            </div>

            {project.originalProblem && (
              <a
                href={project.originalProblem.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white border border-white/10"
              >
                <span>View Public Thread</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                {project.originalProblem?.title || project.title}
              </h3>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 max-h-72 overflow-y-auto">
                <MarkdownRenderer content={project.originalProblem?.body || project.description} />
              </div>
            </div>

            {project.originalProblem && (
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-medium">Source</span>
                  <span className="font-mono font-bold text-white uppercase">{project.originalProblem.source}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-medium">Author</span>
                  <span className="font-semibold text-white">@{project.originalProblem.author}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-medium">Community Comments</span>
                  <span className="font-bold text-white">{project.originalProblem.commentsCount}</span>
                </div>
              </div>
            )}

            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1.5">Target Stack:</span>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map(s => (
                  <span key={s} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/40 text-gray-300 border border-white/5">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
