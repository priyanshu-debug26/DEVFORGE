'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FolderKanban, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Compass, 
  Search, 
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Project, ProjectLifecycleStage } from '@/lib/types';

const STAGE_PROGRESS: Record<ProjectLifecycleStage, { percent: number; label: string; color: string }> = {
  discovered: { percent: 20, label: '1. Problem Found', color: 'bg-purple-500' },
  architected: { percent: 40, label: '2. AI Blueprint Planned', color: 'bg-cyber-cyan' },
  in_progress: { percent: 60, label: '3. In Development', color: 'bg-amber-400' },
  audited: { percent: 80, label: '4. Security Audited', color: 'bg-rose-400' },
  secured: { percent: 100, label: '5. Secured & Ready', color: 'bg-cyber-green' }
};

function getProjectProgress(stage: ProjectLifecycleStage) {
  return STAGE_PROGRESS[stage] || { percent: 20, label: 'Discovered', color: 'bg-gray-500' };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New Project Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRepo, setNewRepo] = useState('');
  const [newStack, setNewStack] = useState('TypeScript, Next.js, Node.js');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete project", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || 'Custom DEVFORGE software project.',
          repositoryUrl: newRepo.trim() || undefined,
          techStack: newStack.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewRepo('');
        fetchProjects();
      }
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filterStage !== 'ALL' && p.stage !== filterStage) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-amber-400" />
            <span>Project Workspaces</span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Track projects from initial discovery to AI build specifications and live repository security audits.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyber-green text-black font-bold text-xs hover:bg-cyber-green/90 transition-all shadow-neon self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Explanatory Banner about Demo Samples vs Real Projects */}
      <div className="p-4 rounded-xl bg-surface border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-2 text-gray-300">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Note on Sample Projects:</strong> Items tagged <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">Demo Sample</span> are pre-seeded examples illustrating full lifecycle stages. You can inspect them, delete them anytime, or create your own from <strong>Find Problems</strong>!
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          <span className="text-[11px] text-gray-400 mr-1 font-medium">Stage:</span>
          {[
            { id: 'ALL', label: 'All Projects' },
            { id: 'discovered', label: 'Discovered' },
            { id: 'architected', label: 'Architected' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'audited', label: 'Audited' },
            { id: 'secured', label: 'Secured' },
          ].map((stg) => (
            <button
              key={stg.id}
              onClick={() => setFilterStage(stg.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStage === stg.id
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {stg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="p-6 rounded-2xl bg-surface/40 border border-white/5 animate-pulse h-48" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center space-y-3">
          <FolderKanban className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No projects found in this view</h3>
          <p className="text-xs text-gray-400">
            Discover an issue from GitHub/Hacker News to promote it into a project, or create one manually with the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => {
            const progress = getProjectProgress(project.stage);
            const isSeedSample = project.id.startsWith('proj_auth_guard') || project.id.startsWith('proj_osv_sync');

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="p-6 rounded-2xl bg-surface border border-white/5 hover:border-amber-400/50 hover:bg-[#121926] transition-all flex flex-col justify-between group shadow-sm relative"
              >
                <div>
                  {/* Top Bar with Stage, Demo Tag & Delete Button */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {progress.label}
                      </span>
                      {isSeedSample && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold bg-white/5 text-gray-400 border border-white/10">
                          Demo Sample
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {project.latestScan ? (
                        <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md font-bold ${
                          project.latestScan.executiveScore >= 80 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          Grade {project.latestScan.securityGrade} ({project.latestScan.executiveScore}/100)
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-500 font-mono">Scan Pending</span>
                      )}

                      {/* Delete Project Button */}
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        disabled={deletingId === project.id}
                        className="p-1 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete this project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed font-sans">
                    {project.description}
                  </p>

                  {/* Progress Bar Visualizer */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>Progress</span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                      <div
                        className={`h-full ${progress.color} transition-all duration-500`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Tech stack pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.techStack.map((stk) => (
                      <span key={stk} className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-gray-300 border border-white/5">
                        {stk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span className="text-[11px] text-gray-400">
                    {project.buildPlan ? 'AI Blueprint Ready' : 'Plan Pending'}
                  </span>

                  <span className="text-[11px] font-semibold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Friendly Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1420] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create New Project Workspace</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-300 font-bold block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Edge AuthGuard: Zero-Trust CSRF Middleware"
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyber-green"
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What developer problem does this project solve?"
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyber-green leading-relaxed"
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">GitHub Repository URL (Optional)</label>
                <input
                  type="text"
                  value={newRepo}
                  onChange={(e) => setNewRepo(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyber-green font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={newStack}
                  onChange={(e) => setNewStack(e.target.value)}
                  placeholder="TypeScript, Next.js, Node.js, Redis"
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyber-green font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyber-green text-black font-bold hover:bg-cyber-green/90 shadow-neon"
                >
                  Create Project Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
