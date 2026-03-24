"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Loader2,
  Save,
  Shield,
  Zap,
  Check,
  Globe,
  Database,
  Cpu,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  normalizeZapSettings,
  type ZapSettings,
} from "@/lib/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<ZapSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function patch<K extends keyof ZapSettings>(key: K, val: ZapSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: val }));
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/settings");
        const json = await res.json();
        if (json?.success) {
          const api = normalizeZapSettings(json?.data?.settings);
          setSettings({ ...api, botName: api.botName });
        }
      } catch (e) {
        // Fallback to defaults handled by initial state
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-500/30 font-sans">
      
      {/* THE "DOTI" BACKGROUND GRID */}
      <div className="absolute inset-0 z-0 opacity-[0.15] [background-image:radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12 lg:py-20 space-y-12">
        
        {/* Header Section */}
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">System Preferences</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Workspace <span className="text-zinc-500">Settings</span>
          </h1>
          <p className="text-sm text-zinc-500 max-w-md">Configure your autonomous bot identity and global automation protocols.</p>
        </header>

        <div className="grid grid-cols-1 gap-12">
          
          {/* Identity & Core Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-zinc-800/50 pb-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">Bot Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-400 ml-1 flex items-center gap-2">
                   <Bot size={12} className="text-blue-500" /> Bot Display Name
                </label>
                <input
                  value={settings.botName}
                  onChange={(e) => patch("botName", e.target.value)}
                  className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 text-[13px] outline-none focus:border-blue-500/40 focus:bg-zinc-900/50 transition-all"
                  placeholder="Zap Assistant"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-400 ml-1 flex items-center gap-2">
                   <Cpu size={12} className="text-blue-500" /> Assistant Tone
                </label>
                <select
                  value={settings.assistantTone}
                  onChange={(e) => patch("assistantTone", e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 text-[13px] outline-none focus:border-blue-500/40 cursor-pointer appearance-none"
                >
                  <option value="balanced">Balanced Output</option>
                  <option value="concise">Concise / Technical</option>
                  <option value="friendly">Friendly / Colloquial</option>
                </select>
              </div>
            </div>
          </section>

          {/* Automation Toggles */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-zinc-800/50 pb-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">Automation Protocols</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "autoJoinMeetings", label: "Autonomous Entry", desc: "Bot automatically joins scheduled calls." },
                { key: "autoRecordMeetings", label: "Passive Recording", desc: "Initiate capture on session start." },
                { key: "aiSummary", label: "Neural Summaries", desc: "Synthesize session highlights via AI." },
                { key: "actionItems", label: "Task Extraction", desc: "Detect and index action items." },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => patch(item.key as any, !settings[item.key as keyof ZapSettings])}
                  className="flex items-start justify-between p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-700 transition-all text-left"
                >
                  <div className="space-y-1 pr-4">
                    <p className="text-[13px] font-semibold text-zinc-200">{item.label}</p>
                    <p className="text-[11px] text-zinc-500 leading-normal">{item.desc}</p>
                  </div>
                  <div className={cn(
                    "h-5 w-5 shrink-0 rounded border transition-all flex items-center justify-center",
                    settings[item.key as keyof ZapSettings] 
                      ? "bg-blue-600 border-blue-500 text-white" 
                      : "bg-zinc-800 border-zinc-700 text-transparent"
                  )}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Infrastructure Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-zinc-800/50 pb-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">Infrastructure & Privacy</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-400 ml-1 flex items-center gap-2">
                  <Database size={12} className="text-blue-500" /> Retention Cycle (Days)
                </label>
                <input
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => patch("retentionDays", Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 text-[13px] outline-none focus:border-blue-500/40 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-zinc-400 ml-1 flex items-center gap-2">
                  <Globe size={12} className="text-blue-500" /> Storage Node Region
                </label>
                <select
                  value={settings.storageRegion}
                  onChange={(e) => patch("storageRegion", e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 text-[13px] outline-none focus:border-blue-500/40 cursor-pointer"
                >
                  <option value="us-east-1">US-East (Virginia)</option>
                  <option value="eu-west-1">EU-West (Dublin)</option>
                  <option value="ap-southeast-1">Asia (Singapore)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Footer Save Area */}
          <footer className="pt-10 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5 text-zinc-500">
              <Shield size={14} strokeWidth={1.5} />
              <p className="text-[10px] font-semibold uppercase tracking-widest">End-to-end encrypted</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "h-11 px-8 rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[180px]",
                saved 
                  ? "bg-emerald-500 text-white" 
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/10"
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Synchronized</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Update Changes</span>
                </>
              )}
            </button>
          </footer>

        </div>
      </div>
    </div>
  );
}