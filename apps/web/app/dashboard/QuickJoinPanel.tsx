import { useState } from "react";
import { useZapStore } from "../../lib/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function QuickJoinPanel() {
    const [title, setTitle] = useState("");
    const [meetingUrl, setMeetingUrl] = useState("");
    const { isLoading: loading, setLoading, addMeeting } = useZapStore();
    const [message, setMessage] = useState("");
    const [meetingId, setMeetingId] = useState("");

    async function handleLaunch(e: React.FormEvent) {
        e.preventDefault();
        if (!meetingUrl.trim() || loading) return;

        // Simple validation for GMeet focus
        if (!meetingUrl.includes("meet.google.com")) {
            setMessage("Zoom & Teams are currently in development. Please use a Google Meet link.");
            return;
        }

        setLoading(true);
        setMessage("");
        setMeetingId("");

        try {
            const res = await fetch(`${API_URL}/api/meetings/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim() || "Live Meeting",
                    meetingUrl: meetingUrl.trim(),
                }),
            });

            const json = await res.json();
            if (!res.ok || !json?.success) {
                throw new Error(json?.error || "Failed to launch bot");
            }

            const id = json.data?.id as string;
            setMeetingId(id);
            addMeeting(json.data); // Sync with Zustand store
            setMessage(`Bot launched (${json.data?.botStatus || "joining"}).`);
            setMeetingUrl("");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Launch failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="quickJoinPanel">
            <div className="quickJoinHeader">
                <div>
                    <h2 className="quickJoinTitle">Quick Join</h2>
                    <p className="quickJoinSub">
                        <span className="text-emerald-400 font-bold">Free</span>: Google Meet
                    </p>
                </div>
            </div>

            <form onSubmit={handleLaunch} className="quickJoinForm">
                <input
                    className="quickJoinInput"
                    type="text"
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                />
                <input
                    className="quickJoinInput"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    required
                    disabled={loading}
                    style={{ flex: 2 }}
                />
                <button className="quickJoinButton" type="submit" disabled={loading || !meetingUrl.trim()}>
                    {loading ? "Launching..." : "Launch Bot"}
                </button>
            </form>

            {message ? (
                <div className="quickJoinNotice">
                    {message} {meetingId ? <a href={`/meetings/${meetingId}`}>Open meeting →</a> : null}
                </div>
            ) : null}
        </div>
    );
}
