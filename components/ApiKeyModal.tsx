'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink, 
  Save, 
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Play,
  Check
} from 'lucide-react';
import { getClientUserKeys, saveClientUserKeys, clearClientUserKeys, countActiveUserKeys } from '@/lib/clientKeys';

interface ApiKeyModalProps {
  onClose: () => void;
}

export function ApiKeyModal({ onClose }: ApiKeyModalProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [cerebrasKey, setCerebrasKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Testing states
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const [testingGroq, setTestingGroq] = useState(false);
  const [groqStatus, setGroqStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const [testingGithub, setTestingGithub] = useState(false);
  const [githubStatus, setGithubStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    const existing = getClientUserKeys();
    if (existing.geminiKey) setGeminiKey(existing.geminiKey);
    if (existing.groqKey) setGroqKey(existing.groqKey);
    if (existing.cerebrasKey) setCerebrasKey(existing.cerebrasKey);
    if (existing.githubToken) setGithubToken(existing.githubToken);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveClientUserKeys({
      geminiKey: geminiKey.trim(),
      groqKey: groqKey.trim(),
      cerebrasKey: cerebrasKey.trim(),
      githubToken: githubToken.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    clearClientUserKeys();
    setGeminiKey('');
    setGroqKey('');
    setCerebrasKey('');
    setGithubToken('');
    setGeminiStatus(null);
    setGroqStatus(null);
    setGithubStatus(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const testKey = async (provider: 'gemini' | 'groq' | 'github', keyVal: string) => {
    if (!keyVal.trim()) return;

    if (provider === 'gemini') {
      setTestingGemini(true);
      setGeminiStatus(null);
    } else if (provider === 'groq') {
      setTestingGroq(true);
      setGroqStatus(null);
    } else {
      setTestingGithub(true);
      setGithubStatus(null);
    }

    try {
      const res = await fetch('/api/gateway/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: keyVal.trim() })
      });
      const data = await res.json();
      const statusObj = { success: data.success, message: data.message || data.error };

      if (provider === 'gemini') setGeminiStatus(statusObj);
      else if (provider === 'groq') setGroqStatus(statusObj);
      else setGithubStatus(statusObj);
    } catch (err: any) {
      const errObj = { success: false, message: err.message || 'Verification failed' };
      if (provider === 'gemini') setGeminiStatus(errObj);
      else if (provider === 'groq') setGroqStatus(errObj);
      else setGithubStatus(errObj);
    } finally {
      if (provider === 'gemini') setTestingGemini(false);
      else if (provider === 'groq') setTestingGroq(false);
      else setTestingGithub(false);
    }
  };

  const activeCount = countActiveUserKeys({ geminiKey, groqKey, cerebrasKey, githubToken });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0c121d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-surface/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyber-green/10 flex items-center justify-center border border-cyber-green/30">
              <Key className="w-4 h-4 text-cyber-green" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Bring Your Own API Keys (BYOK)</h3>
                {activeCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-green/20 text-cyber-green border border-cyber-green/30 font-semibold">
                    {activeCount} Active Key{activeCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Paste your personal keys below. They are saved in your browser and used for your requests.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-gray-300">
          <form onSubmit={handleSave} className="space-y-4">
            {/* 1. Google Gemini Key */}
            <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">1. Google Gemini API Key</span>
                  <span className="text-[10px] text-gray-400 font-mono">(Recommended for Deep Analysis)</span>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyber-green hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex gap-2">
                <input
                  type={showKeys ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setGeminiStatus(null);
                  }}
                  placeholder="Paste your Gemini API key (e.g. AIzaSy...)"
                  className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green font-mono"
                />
                <button
                  type="button"
                  onClick={() => testKey('gemini', geminiKey)}
                  disabled={!geminiKey.trim() || testingGemini}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors shrink-0 disabled:opacity-40"
                >
                  {testingGemini ? 'Testing...' : 'Test Key'}
                </button>
              </div>

              {geminiStatus && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  geminiStatus.success ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}>
                  {geminiStatus.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{geminiStatus.message}</span>
                </div>
              )}
            </div>

            {/* 2. Groq Key */}
            <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">2. Groq API Key</span>
                  <span className="text-[10px] text-gray-400 font-mono">(For Instant Sub-300ms Inference)</span>
                </div>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyber-cyan hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex gap-2">
                <input
                  type={showKeys ? 'text' : 'password'}
                  value={groqKey}
                  onChange={(e) => {
                    setGroqKey(e.target.value);
                    setGroqStatus(null);
                  }}
                  placeholder="Paste your Groq API key (e.g. gsk_...)"
                  className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan font-mono"
                />
                <button
                  type="button"
                  onClick={() => testKey('groq', groqKey)}
                  disabled={!groqKey.trim() || testingGroq}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors shrink-0 disabled:opacity-40"
                >
                  {testingGroq ? 'Testing...' : 'Test Key'}
                </button>
              </div>

              {groqStatus && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  groqStatus.success ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}>
                  {groqStatus.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{groqStatus.message}</span>
                </div>
              )}
            </div>

            {/* 3. GitHub Token */}
            <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">3. GitHub Token (Optional)</span>
                  <span className="text-[10px] text-gray-400 font-mono">(Increases API Rate Limits)</span>
                </div>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-purple-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Generate Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex gap-2">
                <input
                  type={showKeys ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => {
                    setGithubToken(e.target.value);
                    setGithubStatus(null);
                  }}
                  placeholder="Paste GitHub Personal Access Token (e.g. ghp_...)"
                  className="flex-1 p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => testKey('github', githubToken)}
                  disabled={!githubToken.trim() || testingGithub}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors shrink-0 disabled:opacity-40"
                >
                  {testingGithub ? 'Testing...' : 'Test Token'}
                </button>
              </div>

              {githubStatus && (
                <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                  githubStatus.success ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}>
                  {githubStatus.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  <span>{githubStatus.message}</span>
                </div>
              )}
            </div>

            {/* Privacy note & Show/Hide Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showKeys ? 'Hide Keys' : 'Reveal Keys'}</span>
              </button>

              <div className="text-[11px] text-gray-400">
                🔒 Keys stay in your browser and are never exposed publicly.
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Keys</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyber-green text-black font-bold text-xs hover:bg-cyber-green/90 transition-all shadow-neon"
                >
                  {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{savedSuccess ? 'Saved in Browser!' : 'Save & Activate Keys →'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
