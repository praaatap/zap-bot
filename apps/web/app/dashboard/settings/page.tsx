"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronsUpDown,
  Clock3,
  Database,
  ExternalLink,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  Shield,
  Workflow,
  Zap,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  normalizeZapSettings,
  type ZapSettings,
} from "@/lib/settings";

function readLocalSettings(): ZapSettings {
  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? normalizeZapSettings(JSON.parse(stored)) : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function persistLocalSettings(s: ZapSettings) {
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s));
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ZapSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof ZapSettings>(key: K, val: ZapSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: val }));
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const local = readLocalSettings();
      try {
        const res = await fetch("/api/user/settings");
        const json = await res.json();
        if (json?.success) {
          const api = normalizeZapSettings(json?.data?.settings);
          setSettings({ ...api, ...local, botName: api.botName });
        }
      } catch (e) {
        setSettings(local);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
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
    } catch (e) {
      setError("Failed to sync changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-blue-500/30">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24 space-y-20">
        
        {/* Simple Header */}
        <header className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
            <Zap size={12} /> System Configuration
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Settings</h1>
          <p className="text-zinc-500 text-lg">Manage your bot identity and automation protocols.</p>
        </header>

        {/* Sections */}
        <div className="space-y-16">
          
          {/* Identity Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Identity</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Bot Name</label>
                <input
                  value={settings.botName}
                  onChange={(e) => patch("botName", e.target.value)}
                  className="w-full h-14 rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-sm font-bold placeholder:text-zinc-700 outline-none focus:border-blue-500/50 transition-all"
                  placeholder="e.g. Zap Assistant"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Assistant Tone</label>
                <select
                  value={settings.assistantTone}
                  onChange={(e) => patch("assistantTone", e.target.value as any)}
                  className="w-full h-14 rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-sm font-bold outline-none focus:border-blue-500/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:20px] bg-[right_1.5rem_center] bg-no-repeat cursor-pointer"
                >
                  <option value="balanced">Balanced</option>
                  <option value="concise">Concise</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>
          </section>

          {/* Automation Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Automation</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { key: "autoJoinMeetings", label: "Auto-Join Meetings", desc: "Bot will automatically join any scheduled meetings found in your calendar." },
                { key: "autoRecordMeetings", label: "Auto-Record Sessions", desc: "Start high-quality recording as soon as the bot enters the meeting." },
                { key: "aiSummary", label: "Neural Summarization", desc: "Generate an intelligent summary of the meeting highlights after it ends." },
                { key: "actionItems", label: "Extract Action Items", desc: "Automatically identify and list tasks assigned during the call." },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => patch(item.key as any, !settings[item.key as keyof ZapSettings])}
                  className="flex items-center justify-between p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left group"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase italic tracking-tight">{item.label}</p>
                    <p className="text-xs text-zinc-500 max-w-md">{item.desc}</p>
                  </div>
                  <div className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center border transition-all",
                    settings[item.key as keyof ZapSettings] ? "bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white" : "bg-white/5 border-white/10 text-zinc-700"
                  )}>
                    <Check size={18} className={cn(!settings[item.key as keyof ZapSettings] && "opacity-0")} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Data Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Data & Privacy</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Retention Period</label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.retentionDays}
                    onChange={(e) => patch("retentionDays", Number(e.target.value))}
                    className="w-full h-14 rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-sm font-bold outline-none focus:border-blue-500/50"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-zinc-600">Days</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Data Storage Region</label>
                <select
                  value={settings.storageRegion}
                  onChange={(e) => patch("storageRegion", e.target.value as any)}
                  className="w-full h-14 rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-sm font-bold outline-none focus:border-blue-500/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTkgOWwtNyA3LTctNyIvPjwvc3ZnPg==')] bg-[length:20px] bg-[right_1.5rem_center] bg-no-repeat cursor-pointer"
                >
                  <option value="us-east-1">United States (East)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="ap-southeast-1">Asia Pacific</option>
                </select>
              </div>
            </div>
          </section>

          {/* Footer Save Button */}
          <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 text-zinc-600">
              <Shield size={16} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">End-to-end encrypted configuration</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "h-16 px-12 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 min-w-[240px] flex items-center justify-center gap-3",
                saved ? "bg-emerald-500 text-white" : "bg-white text-black hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              )}
            >
              {saving ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : saved ? (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  <span>Configured</span>
                </>
              ) : (
                <span>Save Protocols</span>
              )}
            </button>
          </footer>

        </div>
      </div>
    </div>
  );
}
