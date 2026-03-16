/**
 * LiveKit Bot Integration
 * Supports multiple bots per meeting with recording and transcription
 */

export interface LiveKitBotConfig {
    roomName: string;
    meetingUrl: string;
    meetingTitle?: string;
    startTime?: Date;
    endTime?: Date;
    attendees?: string[];
    botName?: string;
    recordingMode?: "speaker_view" | "gallery_view";
    recordFiletype?: "mp4" | "ogg";
    autoTranscribe?: boolean;
    transcriptionLanguage?: string;
}

export interface BotStatus {
    botId: string;
    status: "pending" | "joining" | "in_meeting" | "recording" | "left" | "failed" | "completed";
    joinedAt?: Date;
    leftAt?: Date;
    error?: string;
}

function getApiKey() {
    return process.env.LIVEKIT_API_KEY || "";
}

function getApiSecret() {
    return process.env.LIVEKIT_API_SECRET || "";
}

function getServerUrl() {
    return process.env.LIVEKIT_SERVER_URL || "http://localhost:7880";
}

function getWebhookUrl() {
    return process.env.LIVEKIT_WEBHOOK_URL || "";
}

function isMockMode() {
    return process.env.LIVEKIT_MOCK === "true";
}

function buildDispatchPayload(config: LiveKitBotConfig, botIndex: number = 1) {
    return {
        room: config.roomName,
        roomName: config.roomName,
        identity: config.botName 
            ? `${config.botName.replace(/\s+/g, "-")}-${botIndex}` 
            : `bot-${botIndex}-${Date.now()}`,
        metadata: {
            type: "recording_bot",
            instance: botIndex,
            meeting_url: config.meetingUrl,
            title: config.meetingTitle || "Meeting",
            startTime: config.startTime?.toISOString(),
            endTime: config.endTime?.toISOString(),
        },
        options: {
            auto_subscribe: true,
            publish: false,
            record: true,
            recordFiletype: config.recordFiletype || "mp4",
            layout: config.recordingMode === "gallery_view" ? "grid" : "speaker",
            height: 1080,
            width: 1920,
            frameRate: 30,
            audioBitrate: 128,
            videoBitrate: 2500,
        },
        egress: {
            preset: config.recordingMode === "gallery_view" ? "grid_layout" : "speaker_layout",
            output: {
                type: "file",
                filepath: `/recordings/${config.roomName}-bot-${botIndex}-${Date.now()}.${config.recordFiletype || "mp4"}`,
            },
            roomName: config.roomName,
        },
        transcription: config.autoTranscribe ? {
            enabled: true,
            language: config.transcriptionLanguage || "en",
            output_transcript_type: "vtt",
        } : null,
    };
}

function isPlaceholder(val: string) {
    return !val || val.includes("<your-") || val.includes("PLACEHOLDER") || val === "your-livekit-api-key";
}

/**
 * Dispatch a bot to join a LiveKit room
 */
export async function dispatchLiveKitBot(
    config: LiveKitBotConfig,
    botIndex: number = 1,
    extra?: { meeting_id?: string; user_id?: string }
): Promise<{ botId: string; status: BotStatus; roomName: string }> {
    const apiKey = getApiKey();
    const apiSecret = getApiSecret();
    const serverUrl = getServerUrl();
    const isMock = isMockMode() || isPlaceholder(apiKey) || isPlaceholder(apiSecret);

    console.log(`[LiveKit] Dispatching bot ${botIndex} to room:`, {
        roomName: config.roomName,
        title: config.meetingTitle,
        botName: config.botName,
        isMock: isMock,
        serverUrl
    });

    if (isMock) {
        console.log(`[LiveKit] Mock mode enabled (manual or missing/placeholder credentials)`);
        const botId = `livekit-bot-mock-${botIndex}-${Date.now()}`;
        return {
            botId,
            roomName: config.roomName,
            status: {
                botId,
                status: "pending",
            },
        };
    }

    try {
        const payload = buildDispatchPayload(config, botIndex);

        // LiveKit bot dispatch typically goes through a custom egress/ingress server
        // This example assumes you have a LiveKit egress service
        const response = await fetch(`${serverUrl}/api/v1/egress`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Note: Real LiveKit usually requires a JWT, 
                // but we follow the existing pattern with improved error check
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[LiveKit] Error ${response.status}:`, errorText);
            throw new Error(`LiveKit API error (${response.status}): ${errorText.substring(0, 100) || response.statusText}`);
        }

        const data = await response.json();
        const botId = data.egress_id || data.id || `bot-${botIndex}-${Date.now()}`;

        console.log(`[LiveKit] Bot ${botIndex} dispatched successfully:`, botId);

        return {
            botId,
            roomName: config.roomName,
            status: {
                botId,
                status: "pending",
            },
        };
    } catch (error) {
        console.error(`[LiveKit] Failed to dispatch bot ${botIndex}:`, error);
        throw error;
    }
}

/**
 * Dispatch multiple bots to the same meeting
 */
export async function dispatchMultipleLiveKitBots(
    config: LiveKitBotConfig,
    numBots: number = 2,
    extra?: { meeting_id?: string; user_id?: string }
): Promise<{
    botIds: string[];
    roomName: string;
    count: number;
    statuses: BotStatus[];
}> {
    console.log(`[LiveKit] Dispatching ${numBots} bots to room: ${config.roomName}`);

    const botIds: string[] = [];
    const statuses: BotStatus[] = [];

    for (let i = 1; i <= numBots; i++) {
        try {
            const result = await dispatchLiveKitBot(config, i, extra);
            botIds.push(result.botId);
            statuses.push(result.status);
            console.log(`[LiveKit] Bot ${i}/${numBots} dispatched`);
        } catch (error) {
            console.error(`[LiveKit] Failed to dispatch bot ${i}/${numBots}:`, error);
            statuses.push({
                botId: `failed-bot-${i}`,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    return {
        botIds,
        roomName: config.roomName,
        count: botIds.length,
        statuses,
    };
}

/**
 * Check bot recording status
 */
export async function getBotRecordingStatus(botId: string): Promise<{ status: string; recordingUrl?: string }> {
    if (isMockMode() || botId.startsWith("livekit-bot-mock")) {
        return { status: "recording" };
    }

    const apiKey = getApiKey();
    const serverUrl = getServerUrl();

    try {
        const response = await fetch(`${serverUrl}/api/v1/egress/${botId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to check status: ${response.status}`);
        }

        const data = await response.json();
        return {
            status: data.state || "unknown",
            recordingUrl: data.file?.download_url,
        };
    } catch (error) {
        console.error("Error checking recording status:", error);
        return { status: "unknown" };
    }
}

/**
 * Stop recording bot
 */
export async function stopLiveKitBot(botId: string): Promise<void> {
    console.log(`[LiveKit] Stopping bot: ${botId}`);

    if (isMockMode() || !getApiKey() || botId.startsWith("livekit-bot-mock")) {
        return;
    }

    const apiKey = getApiKey();
    const serverUrl = getServerUrl();

    try {
        await fetch(`${serverUrl}/api/v1/egress/${botId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });
        console.log(`[LiveKit] Bot ${botId} stopped`);
    } catch (error) {
        console.error("Error stopping bot:", error);
    }
}

/**
 * Get recording URL
 */
export async function getLiveKitRecording(botId: string): Promise<string | null> {
    if (isMockMode() || !getApiKey() || botId.startsWith("livekit-bot-mock")) {
        return null;
    }

    const apiKey = getApiKey();
    const serverUrl = getServerUrl();

    try {
        const response = await fetch(`${serverUrl}/api/v1/egress/${botId}`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        const data = await response.json();
        return data.file?.download_url || null;
    } catch (error) {
        console.error("Error fetching recording:", error);
        return null;
    }
}

/**
 * Get transcript from recording
 */
export async function getLiveKitTranscript(botId: string): Promise<any | null> {
    if (isMockMode() || !getApiKey() || botId.startsWith("livekit-bot-mock")) {
        return null;
    }

    const apiKey = getApiKey();
    const serverUrl = getServerUrl();

    try {
        const response = await fetch(`${serverUrl}/api/v1/egress/${botId}/transcript`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error("Error fetching transcript:", error);
        return null;
    }
}

/**
 * Detect if URL is valid meeting room
 */
export function isValidLiveKitRoom(roomName: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(roomName);
}
