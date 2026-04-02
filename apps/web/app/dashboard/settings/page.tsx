"use client";
import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Loader2,
  Save,
  Shield,
  Zap,
  Globe,
  Database,
  Cpu,
  Activity,
  ChevronDown,
  ShieldCheck,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SETTINGS,
  normalizeZapSettings,
  type ZapSettings,
} from "@/lib/settings";
import { motion } from 'framer-motion';


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
        // Fallback to defaults
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
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" strokeWidth={2.5} />
      </div>
    );
  }

  const automationToggles = [
    { key: "autoJoinMeetings", label: "Autonomous Entry", desc: "Bot automatically joins detected calendar invites.", icon: Globe },
    { key: "autoRecordMeetings", label: "Passive Capture", desc: "Initiate session recording immediately upon entry.", icon: Activity },
    { key: "aiSummary", label: "Neural Summaries", desc: "Synthesize key highlights using ZapBot LLM-4.", icon: Cpu },
    { key: "actionItems", label: "Task Extraction", desc: "Identify and route tasks to your primary workspace.", icon: Zap },
  ];

  return (
    <div className="flex flex-col h-full w-full gap-8 max-w-5xl">
      
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-4">
            <Server size={12} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Workspace Node Config</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-slate-500 font-medium leading-relaxed">
          Manage your AI assistant's identity, automation protocols, and data infrastructure.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        
        {/* Identity Section */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Bot size={20} />
             </div>
             <div>
                <h2 className="text-[16px] font-bold text-slate-900 leading-none mb-1">Bot Identity</h2>
                <p className="text-[13px] font-medium text-slate-400">Configure how the assistant appears in calls.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <label className="text-[13px] font-bold text-slate-700 ml-1">Assistant Display Name</label>
              <input
                value={settings.botName}
                onChange={(e) => patch("botName", e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                placeholder="Zap Assistant"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-[13px] font-bold text-slate-700 ml-1">Linguistic Tone</label>
              <div className="relative">
                <select
                  value={settings.assistantTone}
                  onChange={(e) => patch("assistantTone", e.target.value as any)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer transition-all"
                >
                  <option value="balanced">Balanced Output</option>
                  <option value="concise">Concise / Technical</option>
                  <option value="friendly">Friendly / Colloquial</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Automation Protocols Section */}
        <div className="p-8 bg-slate-50/30 border-b border-slate-100">
           <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <Zap size={20} fill="currentColor" />
             </div>
             <div>
                <h2 className="text-[16px] font-bold text-slate-900 leading-none mb-1">Automation Protocols</h2>
                <p className="text-[13px] font-medium text-slate-400">Define the core behaviors of the AI node.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {automationToggles.map((item) => {
              const isActive = settings[item.key as keyof ZapSettings];
              return (
                <button
                  key={item.key}
                  onClick={() => patch(item.key as any, !isActive)}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-2xl border transition-all text-left group relative overflow-hidden",
                    isActive 
                      ? "border-blue-200 bg-white shadow-sm ring-1 ring-blue-500/5" 
                      : "border-slate-200 bg-white/50 hover:bg-white hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                    isActive ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white border-slate-200 text-slate-400 group-hover:text-slate-600"
                  )}>
                    <item.icon size={18} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 pr-12">
                    <p className={cn("text-[14px] font-bold mb-1", isActive ? "text-slate-900" : "text-slate-600")}>{item.label}</p>
                    <p className="text-[12px] font-medium text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                  
                  {/* Custom Toggle Switch */}
                  <div className={cn(
                    "absolute top-5 right-5 h-5 w-9 rounded-full border transition-all flex items-center px-0.5",
                    isActive ? "bg-blue-600 border-blue-700 shadow-inner" : "bg-slate-200 border-slate-300"
                  )}>
                    <motion.div
                        layout
                        className="h-3.5 w-3.5 rounded-full bg-white shadow-sm"
                        animate={{ x: isActive ? 14 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Infrastructure Section */}
        <div className="p-8">
           <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <Database size={20} />
             </div>
             <div>
                <h2 className="text-[16px] font-bold text-slate-900 leading-none mb-1">Infrastructure & Data</h2>
                <p className="text-[13px] font-medium text-slate-400">Configure data retention and regional storage nodes.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-2.5">
              <label className="text-[13px] font-bold text-slate-700 ml-1">Data Retention Cycle (Days)</label>
              <input
                type="number"
                value={settings.retentionDays}
                onChange={(e) => patch("retentionDays", Number(e.target.value))}
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-[13px] font-bold text-slate-700 ml-1">Primary Storage Region</label>
              <div className="relative">
                <select
                  value={settings.storageRegion}
                  onChange={(e) => patch("storageRegion", e.target.value as any)}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-[14px] font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer transition-all"
                >
                  <option value="us-east-1">US-East (Virginia)</option>
                  <option value="eu-west-1">EU-West (Dublin)</option>
                  <option value="ap-southeast-1">Asia (Singapore)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Footer Save Area */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">AES-256 E2E Encrypted</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "h-12 px-10 rounded-xl text-[14px] font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 min-w-[200px] shadow-lg",
                saved 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
              )}
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : saved ? (
                <>
                  <CheckCircle2 size={18} strokeWidth={3} />
                  <span>Synchronized</span>
                </>
              ) : (
                <>
                  <Save size={16} strokeWidth={2.5} />
                  <span>Commit Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}