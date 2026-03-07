"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type StatusPayload = {
    api: { ok: boolean; timestamp: string; uptimeSeconds: number };
    integrations: {
        googleOAuthConfigured: boolean;
        meetingBaasConfigured: boolean;
        meetingBaasMockMode?: boolean;
        awsConfigured: boolean;
        bedrockConfigured: boolean;
        pineconeConfigured: boolean;
    };
    mode: string;
};

export default function SystemStatus() {
    const [data, setData] = useState<StatusPayload | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API_URL}/api/system/status`);
                const json = await res.json();
                if (!res.ok || !json?.success) {
                    throw new Error(json?.error || "Failed to load system status");
                }
                setData(json.data as StatusPayload);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Status fetch failed");
            }
        }
        load();
    }, []);

    const checks = useMemo(() => {
        if (!data) return [];
        return [
            ["Google OAuth", data.integrations.googleOAuthConfigured],
            ["Meeting BaaS", data.integrations.meetingBaasConfigured],
            ["BaaS Mock", Boolean(data.integrations.meetingBaasMockMode)],
            ["AWS Region", data.integrations.awsConfigured],
            ["Bedrock Model", data.integrations.bedrockConfigured],
            ["Pinecone", data.integrations.pineconeConfigured],
        ] as const;
    }, [data]);

    if (error) {
        return <div className="systemStatus systemStatusErr">System status unavailable: {error}</div>;
    }

    if (!data) {
        return <div className="systemStatus">Checking integration status...</div>;
    }

    const readyCount = checks.filter(([, ok]) => ok).length;

    return (
        <div className="systemStatus">
            <div className="systemStatusTop">
                <div>
                    <div className="systemStatusTitle">System Status</div>
                    <div className="systemStatusSub">
                        Mode: {data.mode} | Uptime: {data.api.uptimeSeconds}s
                    </div>
                </div>
                <a href="/extension" className="systemStatusLink">Extension Guide</a>
            </div>

            <div className="systemStatusGrid">
                {checks.map(([label, ok]) => (
                    <div key={label} className={`systemBadge ${ok ? "ok" : "warn"}`}>
                        <span>{label}</span>
                        <span>{ok ? "Ready" : "Missing"}</span>
                    </div>
                ))}
            </div>

            {readyCount < checks.length ? (
                <div className="systemStatusHint">
                    Complete env setup in `ENV-SETUP.md` for full meeting join and higher suggestion accuracy.
                </div>
            ) : null}
        </div>
    );
}
