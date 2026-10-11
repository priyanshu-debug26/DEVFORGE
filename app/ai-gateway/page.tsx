'use client';

import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { 
  Cpu, 
  Send, 
  Zap, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Copy,
  Check,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GatewayProvider, GatewayEffort, GatewayResponse, ProviderHealth } from '@/lib/types';
import { getClientUserKeys } from '@/lib/clientKeys';

export default function AiGatewayPage() {
  const [prompt, setPrompt] = useState('Architect a zero-trust CSRF and session isolation middleware for Next.js App Router with sub-10ms cryptographic verification.');
  const [effortMode, setEffortMode] = useState<GatewayEffort>('medium');
  const [simulateRateLimit, setSimulateRateLimit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GatewayResponse | null>(null);
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [copied, setCopied] = useState(false);
  const [showAdvancedTrace, setShowAdvancedTrace] = useState(false);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/gateway/health');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error("Failed to fetch gateway health", err);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    try {
      setLoading(true);
      const res = await fetch('/api/gateway/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          effort: effortMode,
          simulateRateLimit,
          userKeys: getClientUserKeys()
        })
      });

      const data = await res.json();
      setResponse(data);
      if (data.failoverOccurred) {
        setShowAdvancedTrace(true); // Automatically show trace if failover was triggered
      }
      fetchHealth();
    } catch (err) {
      console.error("Gateway execution error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response?.content) return;
    navigator.clipboard.writeText(response.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyber-cyan" />
            <span>AI Architect Studio</span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Unified multi-model AI gateway with automatic failover across Gemini, Groq, and Cerebras
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover text-xs font-medium text-gray-300 border border-white/10 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Check AI Providers</span>
        </button>
      </div>

      {/* Provider Status Fleet (Compact & Friendly) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {providers.map((p) => (
          <div
            key={p.provider}
            className="p-3.5 rounded-2xl bg-surface border border-white/5 flex items-center justify-between shadow-sm"
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

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
              p.status === 'online'
                ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                : 'bg-white/5 text-gray-400 border border-white/5'
            }`}>
              {p.configured ? 'Live API' : 'Simulated'}
            </span>
          </div>
        ))}
      </div>

      {/* Main Studio Card */}
      <div className="p-6 rounded-2xl bg-surface border border-white/5 space-y-6 shadow-cyber-card">
        {/* Step 1: Select AI Model Profile */}
        <div>
          <label className="text-xs font-bold text-white block mb-2">
            1. Select AI Engine Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'low',
                title: '⚡ Fast & Snappy',
                desc: 'Ultra-low latency (Groq Llama 8B / Flash)',
                sub: '< 300ms responses'
              },
              {
                id: 'medium',
                title: '⚖️ Balanced (Recommended)',
                desc: 'Optimal balance of speed & architectural depth',
                sub: 'Auto-routed'
              },
              {
                id: 'high',
                title: '🧠 Deep Reasoning',
                desc: 'Maximum context & deep analysis (Gemini Pro)',
                sub: 'High precision'
              }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setEffortMode(mode.id as GatewayEffort)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  effortMode === mode.id
                    ? 'bg-cyber-cyan/15 border-cyber-cyan/50 text-white shadow-neon'
                    : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:bg-black/50'
                }`}
              >
                <div className="font-bold text-xs text-white">{mode.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5 font-sans">{mode.desc}</div>
                <div className="text-[10px] text-cyber-cyan font-mono mt-1">{mode.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Prompt Input Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-white">
              2. Describe Your Problem or Architectural Request
            </label>
            <span className="text-[11px] text-gray-400">Click a preset below or type custom</span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="e.g. Design a high-concurrency rate limiting middleware for Next.js App Router..."
            className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan leading-relaxed font-sans"
          />

          {/* Friendly Presets */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 mr-1 font-medium">Try Presets:</span>
            {[
              "CSRF & Session Guard for Next.js",
              "In-Memory Vector Search Cache",
              "Mitigate CVE-2024-41110 Prototype Pollution"
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPrompt(preset)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 border border-white/5 text-gray-300 hover:text-white transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Hackathon Failover Demo Switch */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-surface to-surface border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Simulate Primary Provider Outage (429 Rate Limit)</span>
            </div>
            <p className="text-[11px] text-gray-300 mt-0.5">
              Turn this on to demonstrate DEVFORGE's automatic secondary provider failover live!
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
            <span className="text-xs font-mono text-gray-400 font-semibold">
              {simulateRateLimit ? 'Enabled' : 'Disabled'}
            </span>
            <input
              type="checkbox"
              checked={simulateRateLimit}
              onChange={(e) => setSimulateRateLimit(e.target.checked)}
              className="w-4 h-4 rounded text-cyber-green bg-black/40 border-white/20 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyber-green text-black font-bold text-xs hover:bg-cyber-green/90 transition-all shadow-neon disabled:opacity-50"
          >
            <Send className={`w-4 h-4 ${loading ? 'animate-bounce' : ''}`} />
            <span>{loading ? 'Routing to AI Engine...' : 'Generate Architecture Blueprint →'}</span>
          </button>
        </div>
      </div>

      {/* Generated Response Card */}
      {response && (
        <div className="p-6 rounded-2xl bg-surface border border-white/5 space-y-4 animate-in fade-in duration-200 shadow-cyber-card">
          {/* Response Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-black/50 text-white border border-white/10">
                Engine: {response.provider.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-cyber-cyan font-semibold">
                {response.model}
              </span>
              <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {response.latencyMs}ms
              </span>
              <span className="text-xs font-mono text-gray-400">
                {response.usage.totalTokens} tokens
              </span>
            </div>

            <div className="flex items-center gap-2">
              {response.failoverOccurred ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Auto-Failover Succeeded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-cyber-green/10 text-cyber-green border border-cyber-green/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" />
                  Primary Route
                </span>
              )}

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs border border-white/10 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Optional Trace Drawer */}
          {response.trace && response.trace.length > 0 && (
            <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
              <button
                type="button"
                onClick={() => setShowAdvancedTrace(!showAdvancedTrace)}
                className="w-full px-4 py-2 text-xs font-mono text-gray-400 hover:text-white flex items-center justify-between bg-black/30"
              >
                <span>Gateway Routing Trace ({response.trace.length} attempts)</span>
                <span>{showAdvancedTrace ? 'Hide Trace ▲' : 'Inspect Routing Details ▼'}</span>
              </button>

              {showAdvancedTrace && (
                <div className="p-3 text-[11px] font-mono space-y-2">
                  {response.trace.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                      <div>
                        <span className="text-gray-500 mr-2">[{idx + 1}]</span>
                        <strong className="text-white">{step.provider}</strong>
                        <span className="text-gray-400 ml-1">({step.model})</span>
                        {step.error && <span className="text-rose-400 ml-2 block sm:inline">→ {step.error}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{step.latencyMs}ms</span>
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                          step.status === 'success' ? 'text-cyber-green bg-cyber-green/10' :
                          step.status === 'failed' ? 'text-rose-400 bg-rose-500/10' : 'text-gray-400 bg-white/5'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generated Text */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 max-h-[500px] overflow-y-auto">
            <MarkdownRenderer content={response.content} />
          </div>
        </div>
      )}
    </div>
  );
}
