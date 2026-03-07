import "./settings.css";
import ManualJoinCard from "./ManualJoinCard";

export default function SettingsPage() {
    return (
        <div className="settingsPage">
            {/* ── Nav ──────────────────────────────────────── */}
            <div className="settingsNav">
                <a href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    ← Back to Dashboard
                </a>
            </div>

            <div className="settingsContent">
                <h1 className="settingsTitle">⚙️ Settings</h1>
                <ManualJoinCard />

                {/* ── Google Calendar ────────────────────────── */}
                <div className="settingsSection">
                    <h2 className="settingsSectionTitle">📅 Google Calendar</h2>
                    <p className="settingsSectionDesc">
                        Connect your Google Calendar to automatically detect meetings and dispatch bots.
                    </p>
                    <div className="settingsRow">
                        <span className="settingsRowLabel">Connection Status</span>
                        <span className="connectedBadge">✓ Connected</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsRowLabel">Account</span>
                        <span className="settingsRowValue">demo@zapbot.ai</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsRowLabel">Auto-sync</span>
                        <span className="settingsRowValue">Every 5 minutes</span>
                    </div>
                    <button className="settingsBtn settingsBtnSecondary" style={{ marginTop: 12 }}>
                        🔄 Reconnect Calendar
                    </button>
                </div>

                {/* ── Meeting BaaS ────────────────────────────── */}
                <div className="settingsSection">
                    <h2 className="settingsSectionTitle">🤖 Meeting BaaS</h2>
                    <p className="settingsSectionDesc">
                        Configure your Meeting BaaS API key for bot dispatch and recording.
                    </p>
                    <div className="settingsField">
                        <label className="settingsLabel" htmlFor="meeting-baas-key">API Key</label>
                        <input
                            id="meeting-baas-key"
                            type="password"
                            className="settingsInput"
                            placeholder="Enter your Meeting BaaS API key..."
                            defaultValue=""
                        />
                    </div>
                    <div className="settingsField">
                        <label className="settingsLabel" htmlFor="webhook-url">Webhook URL</label>
                        <input
                            id="webhook-url"
                            type="text"
                            className="settingsInput"
                            placeholder="https://your-server.com/api/webhooks/meeting-baas"
                            defaultValue="http://localhost:3001/api/webhooks/meeting-baas"
                        />
                    </div>
                    <button className="settingsBtn">💾 Save Configuration</button>
                </div>

                {/* ── AWS Configuration ──────────────────────── */}
                <div className="settingsSection">
                    <h2 className="settingsSectionTitle">☁️ AWS Configuration</h2>
                    <p className="settingsSectionDesc">
                        Configure AWS credentials for S3 storage and Lambda processing.
                    </p>
                    <div className="settingsField">
                        <label className="settingsLabel" htmlFor="aws-region">Region</label>
                        <input
                            id="aws-region"
                            type="text"
                            className="settingsInput"
                            placeholder="us-east-1"
                            defaultValue="us-east-1"
                        />
                    </div>
                    <div className="settingsField">
                        <label className="settingsLabel" htmlFor="s3-bucket">S3 Bucket</label>
                        <input
                            id="s3-bucket"
                            type="text"
                            className="settingsInput"
                            placeholder="zap-bot-meetings"
                            defaultValue="zap-bot-meetings"
                        />
                    </div>
                    <div className="settingsField">
                        <label className="settingsLabel" htmlFor="lambda-function">Lambda Function</label>
                        <input
                            id="lambda-function"
                            type="text"
                            className="settingsInput"
                            placeholder="zap-bot-meeting-processor"
                            defaultValue="zap-bot-meeting-processor"
                        />
                    </div>
                    <button className="settingsBtn">💾 Save AWS Settings</button>
                </div>

                {/* ── Bot Preferences ────────────────────────── */}
                <div className="settingsSection">
                    <h2 className="settingsSectionTitle">⚡ Bot Preferences</h2>
                    <p className="settingsSectionDesc">
                        Customize how Zap Bot behaves in your meetings.
                    </p>
                    <div className="settingsRow">
                        <span className="settingsRowLabel">Bot Name</span>
                        <span className="settingsRowValue">Zap Bot</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsRowLabel">Entry Message</span>
                        <span className="settingsRowValue">👋 Zap Bot has joined to record...</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsRowLabel">Recording Mode</span>
                        <span className="settingsRowValue">Speaker View</span>
                    </div>
                    <div className="settingsRow">
                        <span className="settingsRowLabel">Transcription Language</span>
                        <span className="settingsRowValue">English (auto-detect)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
