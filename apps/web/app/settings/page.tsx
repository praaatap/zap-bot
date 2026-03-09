"use client";

import { useState, useEffect } from "react";
import {
    Settings, Calendar, Bot, Cloud, Zap, Save,
    RefreshCcw, ChevronLeft, Shield, Globe, Bell,
    CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeSection, setActiveSection] = useState("calendar");
    const [botName, setBotName] = useState("Zap Bot");
    const [botImageUrl, setBotImageUrl] = useState("");
    const [apiKey, setApiKey] = useState("mb-xxxxxxxxxxxxx");
    const [webhookUrl, setWebhookUrl] = useState(`${API_URL}/api/webhooks/meeting-baas`);

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const res = await fetch(`${API_URL}/api/user/bot-settings`);
            const data = await res.json();
            if (data.success) {
                setBotName(data.data.botName || "Zap Bot");
                setBotImageUrl(data.data.botImageUrl || "");
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/user/bot-settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ botName, botImageUrl }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setSaving(false);
        }
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/api/upload/bot-avatar`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setBotImageUrl(data.url);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error("Failed to upload avatar:", error);
        } finally {
            setSaving(false);
        }
    }

    async function handleConnectCalendar() {
        try {
            const res = await fetch(`${API_URL}/api/auth/google`);
            const json = await res.json();
            const url = json?.data?.url as string | undefined;
            if (!url) throw new Error("Missing OAuth URL");
            window.location.href = url;
        } catch (error) {
            console.error("Failed to connect calendar:", error);
        }
    }

    const sections = [
        { id: "calendar", label: "Calendar", icon: Calendar },
        { id: "bot", label: "Bot Config", icon: Bot },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-transparent text-slate-900 relative overflow-x-hidden">
            {/* Subtle Grid Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.25]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-12 pb-24">

                {/* Header */}
                <div className="mb-10 space-y-2">
                    <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest group mb-4">
                        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                            <Settings size={20} className="text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
                            <p className="text-xs text-slate-500 font-bold">Manage your Zap Bot configuration</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Sidebar Nav */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1 sticky top-24">
                            {sections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                                        activeSection === s.id
                                            ? "text-blue-700 bg-blue-50 border border-blue-100 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm hover:border hover:border-slate-200 border border-transparent"
                                    )}
                                >
                                    <s.icon size={16} className={cn(activeSection === s.id ? "text-blue-600" : "text-slate-400")} />
                                    {s.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Google Calendar */}
                        {activeSection === "calendar" && (
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                <Calendar size={16} className="text-slate-600" /> Google Calendar
                                            </h2>
                                            <p className="text-xs text-slate-500 font-medium">Connect to auto-detect meetings and dispatch bots.</p>
                                        </div>
                                        <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200 flex items-center gap-1.5 uppercase tracking-widest shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Connected
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                            <span className="text-xs font-bold text-slate-500">Account</span>
                                            <span className="text-xs font-bold text-slate-900">demo@zapbot.ai</span>
                                        </div>
                                        <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                            <span className="text-xs font-bold text-slate-500">Auto-sync</span>
                                            <span className="text-xs font-bold text-slate-900">Every 5 minutes</span>
                                        </div>
                                        <div className="flex items-center justify-between py-3">
                                            <span className="text-xs font-bold text-slate-500">Last Synced</span>
                                            <span className="text-xs font-bold text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleConnectCalendar}
                                        className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 shadow-sm transition-all flex items-center gap-2"
                                    >
                                        <RefreshCcw size={14} className="text-slate-500" />
                                        Reconnect Calendar
                                    </button>
                                </div>

                                {/* Meeting BaaS */}
                                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-6">
                                    <div className="space-y-1">
                                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                            <Globe size={16} className="text-slate-600" /> Meeting BaaS
                                        </h2>
                                        <p className="text-xs text-slate-500 font-medium">Configure bot dispatch and recording API.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">API Key</label>
                                            <input
                                                type="password"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Webhook URL</label>
                                            <input
                                                type="text"
                                                value={webhookUrl}
                                                onChange={(e) => setWebhookUrl(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                                        {saving ? "Saving..." : saved ? "Saved!" : "Save Configuration"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Bot Config */}
                        {activeSection === "bot" && (
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Zap size={16} className="text-blue-600" /> Bot Preferences
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">Customize how Zap Bot behaves in meetings.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-500">Bot Name</span>
                                        <input
                                            type="text"
                                            value={botName}
                                            onChange={(e) => setBotName(e.target.value)}
                                            className="text-xs font-bold text-slate-900 border-none bg-transparent text-right focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-500">Bot Avatar</span>
                                        <div className="flex items-center gap-3">
                                            {botImageUrl && (
                                                <img src={botImageUrl} alt="Bot Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                            )}
                                            <label className="cursor-pointer px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors">
                                                {botImageUrl ? "Change" : "Upload"}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-500">Entry Message</span>
                                        <span className="text-xs font-bold text-slate-900 max-w-[250px] truncate">{botName} has joined to record...</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-500">Recording Mode</span>
                                        <span className="text-xs font-bold text-slate-900">Speaker View</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-500">Transcription Language</span>
                                        <span className="text-xs font-bold text-slate-900">English (auto-detect)</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-xs font-bold text-slate-500">Mock Mode</span>
                                        <div className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-200 uppercase tracking-widest shadow-sm">
                                            Enabled
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        {activeSection === "notifications" && (
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Bell size={16} className="text-slate-600" /> Notifications
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">Configure when and how you receive alerts.</p>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { label: "Meeting started", desc: "When a bot joins a meeting", enabled: true },
                                        { label: "Meeting completed", desc: "When a recording finishes processing", enabled: true },
                                        { label: "Transcript ready", desc: "When AI transcription is available", enabled: true },
                                        { label: "Weekly summary", desc: "Weekly digest of all meetings", enabled: false },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{item.label}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                                            </div>
                                            <div className={cn(
                                                "w-10 h-6 rounded-full transition-all cursor-pointer relative shadow-inner",
                                                item.enabled ? "bg-blue-600" : "bg-slate-200"
                                            )}>
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm",
                                                    item.enabled ? "left-5" : "left-1"
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security */}
                        {activeSection === "security" && (
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Shield size={16} className="text-slate-600" /> Security
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">Manage your account security and data privacy.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-500">Encryption</span>
                                        <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                            <CheckCircle2 size={10} />
                                            AES-256
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-500">Data Region</span>
                                        <span className="text-xs font-bold text-slate-900 font-mono">us-east-1</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                        <span className="text-xs font-bold text-slate-500">2FA</span>
                                        <span className="text-xs font-bold text-slate-500">Via Clerk Auth</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-xs font-bold text-slate-500">Data Retention</span>
                                        <span className="text-xs font-bold text-slate-900">90 days</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Feedback */}
                        {saved && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-xs font-bold shadow-sm">
                                <CheckCircle2 size={14} />
                                Changes saved successfully.
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
