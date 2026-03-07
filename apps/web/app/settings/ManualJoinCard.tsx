"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ManualJoinCard() {
    const [title, setTitle] = useState("");
    const [meetingUrl, setMeetingUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ id: string; status: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!meetingUrl.trim() || loading) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(`${API_URL}/api/meetings/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim() || "Ad-hoc Meeting",
                    meetingUrl: meetingUrl.trim(),
                }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to join");

            setResult({
                id: json.data.id as string,
                status: json.data.botStatus as string,
            });
            setMeetingUrl("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to dispatch bot");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="settingsSection">
            <h2 className="settingsSectionTitle">Join Meeting Now</h2>
            <p className="settingsSectionDesc">
                Paste a Google Meet, Zoom, or Teams URL. Zap Bot will join and start capturing context for live suggestions.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="settingsField">
                    <label className="settingsLabel" htmlFor="manual-title">Meeting Title</label>
                    <input
                        id="manual-title"
                        type="text"
                        className="settingsInput"
                        placeholder="Client prep call"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="settingsField">
                    <label className="settingsLabel" htmlFor="manual-url">Meeting URL</label>
                    <input
                        id="manual-url"
                        type="url"
                        className="settingsInput"
                        placeholder="https://meet.google.com/..."
                        value={meetingUrl}
                        onChange={(e) => setMeetingUrl(e.target.value)}
                        required
                    />
                </div>

                <button className="settingsBtn" type="submit" disabled={loading}>
                    {loading ? "Dispatching..." : "Join with Zap Bot"}
                </button>
            </form>

            {result && (
                <p style={{ marginTop: 12, fontSize: "0.85rem", color: "#34d399" }}>
                    Bot dispatched. Meeting ID: <a href={`/meetings/${result.id}`} style={{ textDecoration: "underline" }}>{result.id}</a> ({result.status})
                </p>
            )}

            {error && (
                <p style={{ marginTop: 12, fontSize: "0.85rem", color: "#f87171" }}>
                    {error}
                </p>
            )}
        </div>
    );
}
