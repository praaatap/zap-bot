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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    API_PERSISTED_SETTINGS_KEYS,
    DEFAULT_SETTINGS,
    SETTINGS_STORAGE_KEY,
    normalizeZapSettings,
    type ZapSettings,
} from "@/lib/settings";

// ─── Types ────────────────────────────────────────────────────────────────────

type SyncMode = "api" | "hybrid" | "fallback";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLocalSettings(): ZapSettings {
    try {
        const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        return stored ? normalizeZapSettings(JSON.parse(stored)) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
}

function persistLocalSettings(s: ZapSettings) {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(s));
}

// ─── ToggleRow ────────────────────────────────────────────────────────────────

function ToggleRow({ value, onChange, label, description }: {
    value: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description: string;
}) {
    return (
        <div className={cn(
            "flex items-start justify-between gap-4 rounded-xl border p-4 transition-all duration-150",
            value
                ? "border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-violet-50/40"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40"
        )}>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={value}
                aria-label={label}
                onClick={() => onChange(!value)}
                className={cn(
                    "relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
                    value ? "bg-indigo-600" : "bg-slate-200 hover:bg-slate-300"
                )}
            >
                <span className={cn(
                    "inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                    value ? "translate-x-[18px]" : "translate-x-[3px]"
                )} />
            </button>
        </div>
    );
}

// ─── SelectRow ────────────────────────────────────────────────────────────────

function SelectRow<T extends string>({ value, onChange, label, options }: {
    value: T;
    onChange: (v: T) => void;
    label: string;
    options: Array<{ value: T; label: string }>;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-800">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as T)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                >
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronsUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ icon: Icon, title, danger = false, children }: {
    icon: React.ElementType;
    title: string;
    danger?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={cn(
            "rounded-2xl border bg-white shadow-sm",
            danger ? "border-red-200/80" : "border-slate-200/80"
        )}>
            {/* Section header band */}
            <div className={cn(
                "flex items-center gap-3 border-b px-6 py-4",
                danger ? "border-red-100 bg-red-50/40" : "border-slate-100 bg-slate-50/50"
            )}>
                <div className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg border",
                    danger
                        ? "border-red-200 bg-red-100"
                        : "border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-violet-50"
                )}>
                    <Icon className={cn("h-3.5 w-3.5", danger ? "text-red-600" : "text-indigo-600")} />
                </div>
                <h2 className={cn("text-sm font-bold tracking-tight", danger ? "text-red-900" : "text-slate-900")}>
                    {title}
                </h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const [settings, setSettings] = useState<ZapSettings>(DEFAULT_SETTINGS);
    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);
    const [saved,    setSaved]    = useState(false);
    const [syncMode, setSyncMode] = useState<SyncMode>("api");
    const [error,    setError]    = useState<string | null>(null);

    function patch<K extends keyof ZapSettings>(key: K, val: ZapSettings[K]) {
        setSettings((prev) => ({ ...prev, [key]: val }));
    }

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            const local = readLocalSettings();
            try {
                const res  = await fetch("/api/user/settings", { cache: "no-store" });
                const json = await res.json();
                if (!res.ok || !json?.success) throw new Error(json?.error ?? "Failed to load");
                const api    = normalizeZapSettings(json?.data?.settings);
                const merged = { ...api, ...local, botName: api.botName };
                setSettings(merged);
                persistLocalSettings(merged);
                setSyncMode("hybrid");
            } catch (e) {
                setSettings(local);
                setSyncMode("fallback");
                setError(e instanceof Error ? e.message : "Using local data.");
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    const completion = useMemo(() => {
        let s = 0;
        if (settings.botName.trim().length > 1) s += 20;
        if (settings.autoJoinMeetings && settings.autoRecordMeetings) s += 20;
        if (settings.aiSummary && settings.actionItems) s += 20;
        if (settings.retentionDays >= 30) s += 20;
        if (settings.emailNotifications || settings.slackNotifications || settings.desktopNotifications) s += 20;
        return s;
    }, [settings]);

    async function handleSave() {
        setSaving(true);
        setError(null);
        const normalized = normalizeZapSettings(settings);
        try {
            const res  = await fetch("/api/user/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: normalized }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error ?? "Save failed");
            const api    = normalizeZapSettings(json?.data?.settings);
            const merged = { ...api, ...normalized, botName: api.botName };
            setSettings(merged);
            persistLocalSettings(merged);
            setSyncMode("hybrid");
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            persistLocalSettings(normalized);
            setSyncMode("fallback");
            setSaved(true);
            setError(e instanceof Error ? `${e.message} — saved locally.` : "Saved locally.");
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    }

    function handleReset() {
        setSettings(DEFAULT_SETTINGS);
        persistLocalSettings(DEFAULT_SETTINGS);
        setSyncMode("fallback");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-500">Loading settings…</p>
                </div>
            </div>
        );
    }

    const syncBadge = {
        api:      { label: "API synced",     dot: "bg-emerald-500",              text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
        hybrid:   { label: "Hybrid sync",    dot: "bg-blue-500",                 text: "text-blue-700",    bg: "bg-blue-50 border-blue-200"       },
        fallback: { label: "Local fallback", dot: "bg-amber-500 animate-pulse",  text: "text-amber-700",   bg: "bg-amber-50 border-amber-200"     },
    }[syncMode];

    const completionColor = completion >= 80 ? "from-emerald-500 to-teal-400"
        : completion >= 40 ? "from-indigo-500 to-violet-500"
        : "from-amber-400 to-orange-500";

    return (
        <div className="min-h-screen bg-[#f7f8fa] px-5 py-6 md:px-8">

            {/* ── Two-column layout: content + sticky sidebar ── */}
            <div className="flex gap-6 items-start">

                {/* ── Left: main settings content ── */}
                <div className="min-w-0 flex-1 space-y-5">

                    {/* Page title row */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                                    syncBadge.bg, syncBadge.text
                                )}>
                                    <span className={cn("h-1.5 w-1.5 rounded-full", syncBadge.dot)} />
                                    {syncBadge.label}
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Bot Settings</h1>
                            <p className="mt-0.5 text-sm font-medium text-slate-400">Configure Zap Bot behaviour, AI features & integrations.</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={cn(
                                "inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60",
                                saved && !error
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
                            )}
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" />
                              : saved && !error ? <CheckCircle2 className="h-4 w-4" />
                              : <Save className="h-4 w-4" />}
                            {saving ? "Saving…" : saved && !error ? "Saved!" : "Save Changes"}
                        </button>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <p className="text-xs font-medium text-amber-700">{error}</p>
                        </div>
                    )}

                    {/* ── Bot Identity ── */}
                    <Section icon={Bot} title="Bot Identity">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-800">Bot Display Name</label>
                                <input
                                    value={settings.botName}
                                    onChange={(e) => patch("botName", e.target.value)}
                                    placeholder="Zap Bot"
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                            <SelectRow
                                label="Assistant Tone"
                                value={settings.assistantTone}
                                onChange={(v) => patch("assistantTone", v)}
                                options={[
                                    { value: "balanced", label: "Balanced" },
                                    { value: "concise",  label: "Concise"  },
                                    { value: "friendly", label: "Friendly" },
                                ]}
                            />
                            <SelectRow
                                label="Fallback Language"
                                value={settings.fallbackLanguage}
                                onChange={(v) => patch("fallbackLanguage", v)}
                                options={[
                                    { value: "en", label: "English" },
                                    { value: "es", label: "Spanish" },
                                    { value: "fr", label: "French"  },
                                    { value: "de", label: "German"  },
                                ]}
                            />
                        </div>
                    </Section>

                    {/* ── Automation ── */}
                    <Section icon={Workflow} title="Automation Rules">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <ToggleRow value={settings.autoJoinMeetings}   onChange={(v) => patch("autoJoinMeetings", v)}   label="Auto Join Meetings"    description="Automatically join eligible calendar meetings." />
                            <ToggleRow value={settings.autoLeaveWhenEmpty} onChange={(v) => patch("autoLeaveWhenEmpty", v)} label="Auto Leave Empty Calls" description="Leave after 3 min when no participants remain." />
                            <ToggleRow value={settings.autoRecordMeetings} onChange={(v) => patch("autoRecordMeetings", v)} label="Auto Record"            description="Start recording automatically when meeting starts." />
                            <ToggleRow value={settings.autoSendFollowup}   onChange={(v) => patch("autoSendFollowup", v)}   label="Auto Follow-up"         description="Send summary & action items post-meeting." />
                        </div>
                    </Section>

                    {/* ── AI Intelligence ── */}
                    <Section icon={Sparkles} title="AI Intelligence">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <ToggleRow value={settings.liveTranscript}  onChange={(v) => patch("liveTranscript", v)}  label="Live Transcript"        description="Generate a live transcript feed during meetings." />
                            <ToggleRow value={settings.aiSummary}       onChange={(v) => patch("aiSummary", v)}       label="AI Summary"             description="Create concise post-meeting summaries." />
                            <ToggleRow value={settings.actionItems}     onChange={(v) => patch("actionItems", v)}     label="Action Item Extraction" description="Detect owners and due dates from discussion." />
                            <ToggleRow value={settings.speakerLabels}   onChange={(v) => patch("speakerLabels", v)}   label="Speaker Labels"         description="Identify speaker turns in transcripts." />
                            <div className="sm:col-span-2">
                                <ToggleRow value={settings.smartChaptering} onChange={(v) => patch("smartChaptering", v)} label="Smart Chaptering" description="Split recordings into topic-based chapters for faster review." />
                            </div>
                        </div>
                    </Section>

                    {/* ── Recording & Data ── */}
                    <Section icon={Database} title="Recording & Data Policy">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <SelectRow
                                label="Recording Quality"
                                value={settings.recordingQuality}
                                onChange={(v) => patch("recordingQuality", v)}
                                options={[
                                    { value: "standard", label: "Standard (fast upload)" },
                                    { value: "high",     label: "High (best quality)"    },
                                ]}
                            />
                            <SelectRow
                                label="Storage Region"
                                value={settings.storageRegion}
                                onChange={(v) => patch("storageRegion", v)}
                                options={[
                                    { value: "us-east-1",      label: "US East"      },
                                    { value: "eu-west-1",      label: "EU West"      },
                                    { value: "ap-southeast-1", label: "AP Southeast" },
                                ]}
                            />
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-800">Retention (days)</label>
                                <input
                                    type="number"
                                    min={7}
                                    max={365}
                                    value={settings.retentionDays}
                                    onChange={(e) => {
                                        const n = Number(e.target.value);
                                        if (!isNaN(n)) patch("retentionDays", Math.min(365, Math.max(7, n)));
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                />
                                <p className="text-[11px] text-slate-400">Min 7 · Max 365 days</p>
                            </div>
                        </div>
                    </Section>

                    {/* ── Notifications ── */}
                    <Section icon={Bell} title="Notifications">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <ToggleRow value={settings.emailNotifications}   onChange={(v) => patch("emailNotifications", v)}   label="Email Notifications"   description="Summaries and alerts via email." />
                            <ToggleRow value={settings.slackNotifications}   onChange={(v) => patch("slackNotifications", v)}   label="Slack Notifications"   description="Push updates to linked Slack channel." />
                            <ToggleRow value={settings.desktopNotifications} onChange={(v) => patch("desktopNotifications", v)} label="Desktop Notifications" description="In-browser alerts for meeting events." />
                            <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
                                <div className="mb-2 flex items-center gap-2">
                                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                    <p className="text-sm font-semibold text-slate-800">Daily Digest Time</p>
                                </div>
                                <input
                                    type="time"
                                    value={settings.dailyDigestHour}
                                    onChange={(e) => patch("dailyDigestHour", e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>
                    </Section>

                    {/* ── Integrations ── */}
                    <Section icon={Calendar} title="Integrations">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {[
                                { href: "/dashboard/calendar", label: "Google Calendar", desc: "Manage sync and meeting events.",   icon: Calendar, from: "from-blue-50",   to: "to-indigo-50/60",  border: "border-blue-100",   accent: "text-blue-600"   },
                                { href: "/dashboard/help",     label: "Slack",           desc: "Connect notifications & channels.", icon: Bell,     from: "from-violet-50", to: "to-purple-50/60",  border: "border-violet-100", accent: "text-violet-600" },
                                { href: "/dashboard/docs",     label: "API & Webhooks",  desc: "Advanced integration via docs.",    icon: Sparkles, from: "from-amber-50",  to: "to-orange-50/60",  border: "border-amber-100",  accent: "text-amber-600"  },
                            ].map(({ href, label, desc, icon: Icon, from, to, border, accent }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "group flex flex-col gap-3 rounded-xl border p-4 bg-gradient-to-br transition-all",
                                        "hover:shadow-md hover:scale-[1.015] active:scale-[0.99]",
                                        from, to, border
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <Icon className={cn("h-5 w-5", accent)} />
                                        <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{label}</p>
                                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Section>

                    {/* ── Danger Zone ── */}
                    <Section icon={Shield} title="Danger Zone" danger>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Reset All Preferences</p>
                                <p className="mt-0.5 text-xs text-slate-500">Restore every setting to its default. Your meetings and recordings are unaffected.</p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 active:scale-95"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset Defaults
                            </button>
                        </div>
                    </Section>

                    <div className="pb-6" />
                </div>

                {/* ── Right: sticky sidebar summary ── */}
                <div className="hidden w-64 shrink-0 xl:block">
                    <div className="sticky top-20 space-y-4">

                        {/* Setup progress card */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Setup Progress</p>
                            </div>
                            <div className="p-4">
                                <div className="mb-3 flex items-end justify-between">
                                    <p className="text-3xl font-extrabold text-slate-900">{completion}%</p>
                                    <p className="text-xs font-semibold text-slate-400 mb-1">complete</p>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={cn("h-2 rounded-full bg-gradient-to-r transition-all duration-700", completionColor)}
                                        style={{ width: `${completion}%` }}
                                    />
                                </div>
                                <div className="mt-4 space-y-2">
                                    {[
                                        { label: "Bot name set",       done: settings.botName.trim().length > 1 },
                                        { label: "Auto join & record", done: settings.autoJoinMeetings && settings.autoRecordMeetings },
                                        { label: "AI features on",     done: settings.aiSummary && settings.actionItems },
                                        { label: "Retention ≥ 30d",   done: settings.retentionDays >= 30 },
                                        { label: "Notifications set",  done: settings.emailNotifications || settings.slackNotifications || settings.desktopNotifications },
                                    ].map(({ label, done }) => (
                                        <div key={label} className="flex items-center gap-2.5">
                                            <div className={cn(
                                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                                                done ? "border-emerald-300 bg-emerald-100" : "border-slate-200 bg-slate-50"
                                            )}>
                                                {done && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />}
                                            </div>
                                            <p className={cn("text-xs font-medium", done ? "text-slate-700" : "text-slate-400")}>{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Stats card */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Config Summary</p>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {[
                                    { label: "Sync Mode",   value: syncMode,                         badge: syncBadge },
                                    { label: "Retention",   value: `${settings.retentionDays} days`,  badge: null      },
                                    { label: "API Fields",  value: `${API_PERSISTED_SETTINGS_KEYS.length} keys`, badge: null },
                                ].map(({ label, value, badge }) => (
                                    <div key={label} className="flex items-center justify-between px-4 py-3">
                                        <p className="text-xs font-semibold text-slate-400">{label}</p>
                                        {badge ? (
                                            <span className={cn(
                                                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize",
                                                badge.bg, badge.text
                                            )}>
                                                <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
                                                {value}
                                            </span>
                                        ) : (
                                            <p className="text-xs font-bold text-slate-800">{value}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={cn(
                                "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60",
                                saved && !error
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
                            )}
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" />
                              : saved && !error ? <CheckCircle2 className="h-4 w-4" />
                              : <Save className="h-4 w-4" />}
                            {saving ? "Saving…" : saved && !error ? "Saved!" : "Save All Changes"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
