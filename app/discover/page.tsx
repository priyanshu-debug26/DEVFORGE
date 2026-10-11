'use client';

import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useRouter } from 'next/navigation';
import { 
  Compass, 
  Search, 
  ExternalLink, 
  MessageSquare, 
  ThumbsUp, 
  Sparkles, 
  FolderPlus, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  X,
  Layers,
  Check
} from 'lucide-react';
import { DeveloperProblem } from '@/lib/types';
import { getClientUserKeys } from '@/lib/clientKeys';

export default function DiscoverPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<DeveloperProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'github' | 'hackernews'>('all');
  const [selectedTag, setSelectedTag] = useState('');

  // Selected Problem Modal
  const [activeProblem, setActiveProblem] = useState<DeveloperProblem | null>(null);
  const [modalTab, setModalTab] = useState<'problem' | 'ai_solution'>('problem');
  const [analyzing, setAnalyzing] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      if (selectedTag) params.set('tag', selectedTag);

      const res = await fetch(`/api/discover?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProblems(data.problems || []);
      } else {
        setError(data.error || 'Failed to fetch developer problems');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching developer problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [sourceFilter, selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProblems();
  };

  const handleAnalyze = async (problem: DeveloperProblem) => {
    try {
      setAnalyzing(true);
      const res = await fetch('/api/discover/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, userKeys: getClientUserKeys() })
      });

      const data = await res.json();
      if (data.success && data.problem) {
        setActiveProblem(data.problem);
        setProblems(prev => prev.map(p => p.id === data.problem.id ? data.problem : p));
        setModalTab('ai_solution'); // Switch to solution tab automatically
      }
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePromoteToProject = async (problem: DeveloperProblem) => {
    try {
      setPromoting(true);
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: problem.title.slice(0, 80),
          description: problem.body.slice(0, 300),
          originalProblem: problem,
          tags: problem.tags,
          techStack: problem.analysis?.suggestedStack ? Object.values(problem.analysis.suggestedStack).flat() : ['TypeScript', 'Next.js']
        })
      });

      const data = await res.json();
      if (data.success && data.project) {
        router.push(`/projects/${data.project.id}`);
      }
    } catch (err) {
      console.error("Promotion failed", err);
      setPromoting(false);
    }
  };

  const openProblemModal = (problem: DeveloperProblem) => {
    setActiveProblem(problem);
    setModalTab(problem.analysis ? 'ai_solution' : 'problem');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-cyber-green" />
            <span>Discover Real Problems</span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Pick a real issue from GitHub or Hacker News. Analyze it with AI and turn it into a verified project.
          </p>
        </div>

        <button
          onClick={fetchProblems}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-gray-200 text-xs border border-white/10 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyber-green' : ''}`} />
          <span>Refresh Live Issues</span>
        </button>
      </div>

      {/* Clean Search and Filter Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-white/5 space-y-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic, e.g. 'auth', 'memory leak', 'rate limit', 'docker'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-cyber-green text-black font-bold text-xs rounded-xl hover:bg-cyber-green/90 transition-colors shadow-neon"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
          {/* Source Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-gray-400 text-[11px] font-medium mr-1">Source:</span>
            {(['all', 'github', 'hackernews'] as const).map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sourceFilter === src
                    ? 'bg-cyber-green text-black font-bold'
                    : 'bg-black/30 text-gray-300 hover:text-white border border-white/5'
                }`}
              >
                {src === 'all' ? 'All Sources' : src === 'github' ? 'GitHub Issues' : 'Hacker News'}
              </button>
            ))}
          </div>

          {/* Tag Quick Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-gray-400 text-[11px] font-medium mr-1">Quick Topics:</span>
            {[
              { id: 'bug', label: 'Bugs' },
              { id: 'security', label: 'Security' },
              { id: 'performance', label: 'Performance' },
              { id: 'docker', label: 'DevOps' }
            ].map((tg) => (
              <button
                key={tg.id}
                onClick={() => setSelectedTag(selectedTag === tg.id ? '' : tg.id)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                  selectedTag === tg.id
                    ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/40 font-semibold'
                    : 'bg-surface text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                #{tg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problems Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="p-5 rounded-2xl bg-surface/40 border border-white/5 animate-pulse space-y-3 h-48" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center text-xs text-rose-300">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="font-semibold text-white">{error}</p>
          <button
            onClick={fetchProblems}
            className="mt-3 px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-white hover:bg-surface-hover"
          >
            Try Again
          </button>
        </div>
      ) : problems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-white/5 text-center space-y-3">
          <Compass className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No developer problems found</h3>
          <p className="text-xs text-gray-400">
            Try adjusting your search terms or clearing the selected topic filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => {
            const hasAnalysis = !!problem.analysis;

            return (
              <div
                key={problem.id}
                onClick={() => openProblemModal(problem)}
                className="p-5 rounded-2xl bg-surface border border-white/5 hover:border-cyber-green/40 hover:bg-[#121926] transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Top Badge & Source */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                      problem.source === 'github'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {problem.source === 'github' ? 'GitHub Issue' : 'Hacker News'}
                    </span>

                    {hasAnalysis ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyber-green bg-cyber-green/10 px-2 py-0.5 rounded-md border border-cyber-green/30 font-semibold">
                        <Sparkles className="w-3 h-3 text-cyber-green" />
                        AI Planned ({problem.analysis?.projectOpportunityScore}/100)
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500">Unanalyzed</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-cyber-green transition-colors line-clamp-2 leading-snug">
                    {problem.title}
                  </h3>

                  {/* Body Snippet */}
                  <p className="text-xs text-gray-300 mt-2 line-clamp-3 leading-relaxed">
                    {problem.body}
                  </p>
                </div>

                {/* Footer Metadata & CTA */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <MessageSquare className="w-3 h-3 text-gray-400" />
                      <span>{problem.commentsCount}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <ThumbsUp className="w-3 h-3 text-gray-400" />
                      <span>{problem.upvotesCount}</span>
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-cyber-green group-hover:underline flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User-Friendly Tabbed Modal */}
      {activeProblem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] bg-[#0d131f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                  activeProblem.source === 'github' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {activeProblem.source.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-gray-400">{activeProblem.sourceId}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeProblem.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <span>Open Thread</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setActiveProblem(null)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs: Problem vs AI Solution */}
            <div className="px-6 pt-3 border-b border-white/5 flex gap-4 bg-surface/30">
              <button
                onClick={() => setModalTab('problem')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
                  modalTab === 'problem'
                    ? 'border-cyber-green text-white font-bold'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                1. Original Problem
              </button>

              <button
                onClick={() => setModalTab('ai_solution')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  modalTab === 'ai_solution'
                    ? 'border-cyber-green text-white font-bold'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyber-green" />
                <span>2. AI Blueprint & Roadmap</span>
                {activeProblem.analysis && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyber-green/20 text-cyber-green font-mono">
                    Ready
                  </span>
                )}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {modalTab === 'problem' ? (
                /* Tab 1: Original Problem */
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-white mb-2 leading-snug">
                      {activeProblem.title}
                    </h2>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 max-h-64 overflow-y-auto">
                      <MarkdownRenderer content={activeProblem.body} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-surface border border-white/5">
                      <span className="text-[10px] text-gray-400 block font-medium">Author</span>
                      <span className="text-xs font-semibold text-white">@{activeProblem.author}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-white/5">
                      <span className="text-[10px] text-gray-400 block font-medium">Comments</span>
                      <span className="text-xs font-semibold text-white">{activeProblem.commentsCount}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-white/5">
                      <span className="text-[10px] text-gray-400 block font-medium">Upvotes</span>
                      <span className="text-xs font-semibold text-white">{activeProblem.upvotesCount}</span>
                    </div>
                  </div>

                  {!activeProblem.analysis && (
                    <div className="p-4 rounded-xl bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Ready for AI Analysis?</div>
                        <div className="text-[11px] text-gray-300">
                          DEVFORGE AI will identify root causes, target personas, and construct a phased implementation plan.
                        </div>
                      </div>
                      <button
                        onClick={() => handleAnalyze(activeProblem)}
                        disabled={analyzing}
                        className="px-4 py-2 rounded-xl bg-cyber-green text-black font-bold text-xs hover:bg-cyber-green/90 transition-all shadow-neon shrink-0 ml-3"
                      >
                        {analyzing ? 'Analyzing...' : 'Generate Blueprint →'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Tab 2: AI Solution & Roadmap */
                <div className="space-y-4">
                  {activeProblem.analysis ? (
                    <>
                      {/* Top Opportunity Banner */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-surface to-[#121b2b] border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-400 font-medium">Viability & Opportunity Rating</div>
                          <div className="text-xl font-bold text-white mt-0.5">
                            {activeProblem.analysis.projectOpportunityScore}/100 — High Potential
                          </div>
                        </div>
                        <span className="text-xs font-mono px-3 py-1 rounded-lg bg-cyber-green/10 text-cyber-green border border-cyber-green/30 font-semibold">
                          Via {activeProblem.analysis.providerUsed.toUpperCase()}
                        </span>
                      </div>

                      {/* Uncertainty Advisory Notice */}
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                        <div className="flex items-center gap-2 font-bold text-[11px] mb-0.5">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span>Advisory: AI-Generated Assessment</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-300/90 font-sans">
                          {activeProblem.analysis.uncertaintyAdvisory}
                        </p>
                      </div>

                      {/* Root cause and Personas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold">Root Cause Breakdown</span>
                          <p className="text-xs text-gray-200 leading-relaxed font-sans">
                            {activeProblem.analysis.rootCause}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold">Affected Personas</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {activeProblem.analysis.affectedPersonas.map((p, i) => (
                              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-cyber-cyan border border-cyber-cyan/30">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recommended Tech Stack */}
                      <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold block">
                          Recommended Architecture Stack
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(activeProblem.analysis.suggestedStack || {}).map(([cat, items]) => (
                            <div key={cat} className="p-2 rounded-lg bg-black/30 border border-white/5">
                              <span className="text-[10px] font-mono text-gray-400 uppercase">{cat}</span>
                              <div className="text-white font-medium text-[11px] mt-0.5">
                                {(items as string[]).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Phased Roadmap */}
                      <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-gray-400 font-semibold block">
                          Phased Implementation Roadmap
                        </span>
                        <div className="space-y-2">
                          {activeProblem.analysis.implementationPhases.map((phase, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-black/30 border border-white/5 flex items-start justify-between">
                              <div>
                                <div className="font-bold text-white text-xs">{phase.phase}</div>
                                <div className="text-[11px] text-gray-400 mt-0.5 font-sans">
                                  Deliverables: {phase.deliverables.join(' • ')}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-cyber-green shrink-0 ml-2 font-semibold">
                                {phase.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-10 rounded-xl bg-surface border border-white/5 text-center space-y-3">
                      <Cpu className="w-10 h-10 text-cyber-cyan mx-auto" />
                      <h3 className="text-sm font-bold text-white">AI Blueprint Not Yet Generated</h3>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        Click below to run multi-model analysis and extract architecture recommendations.
                      </p>
                      <button
                        onClick={() => handleAnalyze(activeProblem)}
                        disabled={analyzing}
                        className="px-5 py-2.5 rounded-xl bg-cyber-green text-black font-bold text-xs hover:bg-cyber-green/90 shadow-neon"
                      >
                        {analyzing ? 'Analyzing...' : 'Generate Blueprint with AI'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-surface/50 flex items-center justify-between">
              <button
                onClick={() => setActiveProblem(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => handlePromoteToProject(activeProblem)}
                disabled={promoting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyber-green text-black font-bold text-xs hover:bg-cyber-green/90 transition-all shadow-neon disabled:opacity-50"
              >
                <FolderPlus className="w-4 h-4" />
                <span>{promoting ? 'Creating Project...' : 'Promote to Project Workspace →'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
