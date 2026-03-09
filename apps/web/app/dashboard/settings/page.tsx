"use client";

import { useState, useEffect } from "react";
import { Save, User, Bell, Calendar, Zap, Shield, Trash2, CheckCircle2, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [settings, setSettings] = useState({
        botName: "Zap Bot",
        autoJoinMeetings: true,
        recordMeetings: true,
        transcribeAudio: true,
        aiSummary: true,
        emailNotifications: true,
        slackNotifications: false,
        calendarSync: true,
    });

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const sections = [
        {
            title: "Profile Settings",
            icon: User,
            items: [
                {
                    label: "Bot Display Name",
                    description: "How your bot will appear in meetings",
                    type: "input",
                    value: settings.botName,
                    onChange: (val: string) => setSettings({ ...settings, botName: val }),
                },
            ],
        },
        {
            title: "Meeting Preferences",
            icon: Calendar,
            items: [
                {
                    label: "Auto-join Meetings",
                    description: "Automatically join scheduled meetings from calendar",
                    type: "toggle",
                    value: settings.autoJoinMeetings,
                    onChange: (val: boolean) => setSettings({ ...settings, autoJoinMeetings: val }),
                },
                {
                    label: "Record Meetings",
                    description: "Save meeting recordings to cloud storage",
                    type: "toggle",
                    value: settings.recordMeetings,
                    onChange: (val: boolean) => setSettings({ ...settings, recordMeetings: val }),
                },
                {
                    label: "Transcribe Audio",
                    description: "Generate text transcripts from meeting audio",
                    type: "toggle",
                    value: settings.transcribeAudio,
                    onChange: (val: boolean) => setSettings({ ...settings, transcribeAudio: val }),
                },
            ],
        },
        {
            title: "AI Features",
            icon: Zap,
            items: [
                {
                    label: "AI-Powered Summaries",
                    description: "Generate intelligent meeting summaries and action items",
                    type: "toggle",
                    value: settings.aiSummary,
                    onChange: (val: boolean) => setSettings({ ...settings, aiSummary: val }),
                },
            ],
        },
        {
            title: "Notifications",
            icon: Bell,
            items: [
                {
                    label: "Email Notifications",
                    description: "Receive meeting summaries via email",
                    type: "toggle",
                    value: settings.emailNotifications,
                    onChange: (val: boolean) => setSettings({ ...settings, emailNotifications: val }),
                },
                {
                    label: "Slack Notifications",
                    description: "Send summaries to Slack channels",
                    type: "toggle",
                    value: settings.slackNotifications,
                    onChange: (val: boolean) => setSettings({ ...settings, slackNotifications: val }),
                },
            ],
        },
        {
            title: "Integrations",
            icon: Shield,
            items: [
                {
                    label: "Google Calendar Sync",
                    description: "Sync with Google Calendar for automatic meeting detection",
                    type: "toggle",
                    value: settings.calendarSync,
                    onChange: (val: boolean) => setSettings({ ...settings, calendarSync: val }),
                },
            ],
        },
    ];

    return (
        <div className="p-8 min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
                        <p className="text-slate-600">Manage your account and preferences</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <CheckCircle2 size={18} />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                {/* Settings Sections */}
                {sections.map((section) => (
                    <div key={section.title} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <section.icon size={20} className="text-slate-600" />
                                <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-200">
                            {section.items.map((item, idx) => (
                                <div key={idx} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-1">{item.label}</h3>
                                        <p className="text-sm text-slate-600">{item.description}</p>
                                    </div>

                                    {item.type === "toggle" ? (
                                        <button
                                            onClick={() => item.onChange(!item.value)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                item.value ? "bg-blue-600" : "bg-slate-300"
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    item.value ? "translate-x-6" : "translate-x-1"
                                                }`}
                                            />
                                        </button>
                                    ) : (
                                        <input
                                            type="text"
                                            value={item.value}
                                            onChange={(e) => item.onChange(e.target.value)}
                                            className="w-64 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Danger Zone */}
                <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-red-200 bg-red-50">
                        <div className="flex items-center gap-3">
                            <Trash2 size={20} className="text-red-600" />
                            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                        </div>
                    </div>
                    <div className="px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1">Delete Account</h3>
                                <p className="text-sm text-slate-600">Permanently delete your account and all data</p>
                            </div>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
