/**
 * Meeting BaaS (Bot as a Service) Integration
 * 
 * This service handles dispatching bots to join meetings automatically via MeetingBaas
 */

export interface MeetingBotConfig {
    meetingUrl: string;
    meetingTitle?: string;
    startTime?: Date;
    endTime?: Date;
    attendees?: string[];
    autoRecord?: boolean;
    autoTranscribe?: boolean;
}

export interface BotStatus {
    botId: string;
    status: "pending" | "joining" | "in_meeting" | "recording" | "left" | "failed" | "completed";
    joinedAt?: Date;
    leftAt?: Date;
    error?: string;
}

function getApiKey() {
    return process.env.MEETING_BAAS_API_KEY || "";
}

function getWebhookUrl() {
    return process.env.MEETING_BAAS_WEBHOOK_URL || "";
}

function isMockMode() {
    return process.env.MEETING_BAAS_MOCK === "true";
}

/**
 * Dispatch a bot to join a meeting
 */
export async function dispatchMeetingBot(
    config: MeetingBotConfig
): Promise<{ botId: string; status: BotStatus }> {
    console.log("Dispatching bot to meeting:", {
        meetingUrl: config.meetingUrl,
        title: config.meetingTitle,
        startTime: config.startTime,
        isMock: isMockMode()
    });

    if (isMockMode() || !getApiKey()) {
        const botId = `mock-bot-${Date.now()}`;
        return {
            botId,
            status: {
                botId,
                status: "pending",
            },
        };
    }

    try {
        const response = await fetch("https://api.meetingbaas.com/bots", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-meeting-baas-api-key": getApiKey(),
            },
            body: JSON.stringify({
                meeting_url: config.meetingUrl,
                bot_name: "Zap Bot",
                bot_image: "https://zap-bot.vercel.app/zap-bot-logo.png", // Optional branding
                webhook_url: getWebhookUrl(),
            }),
        }); 

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Meeting BaaS API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const botId = data.bot_id || data.id;

        return {
            botId: botId,
            status: {
                botId: botId,
                status: "pending", // MeetingBaaS typical initial status
            },
        };
    } catch (error) {
        console.error("Failed to dispatch Meeting BaaS bot:", error);
        throw error;
    }
}

/**
 * Check bot status
 */
export async function getBotStatus(botId: string): Promise<BotStatus> {
    if (isMockMode() || !getApiKey() || botId.startsWith("mock-bot")) {
        return {
            botId,
            status: "in_meeting",
            joinedAt: new Date(),
        };
    }

    try {
        const response = await fetch(`https://api.meetingbaas.com/bots/${botId}`, {
            method: "GET",
            headers: {
                "x-meeting-baas-api-key": getApiKey(),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to check bot status: ${response.status}`);
        }

        const data = await response.json();

        let mappedStatus: BotStatus["status"] = "pending";
        // Map Meeting BaaS actual status strings to our internal types
        if (data.status === "joining") mappedStatus = "joining";
        if (data.status === "joined" || data.status === "recording") mappedStatus = "in_meeting";
        if (data.status === "completed" || data.status === "left") mappedStatus = "left";
        if (data.status === "failed" || data.status === "error") mappedStatus = "failed";

        return {
            botId: data.bot_id || data.id || botId,
            status: mappedStatus,
            joinedAt: data.joined_at ? new Date(data.joined_at) : undefined,
            leftAt: data.left_at ? new Date(data.left_at) : undefined,
        };
    } catch (error) {
        console.error("Error checking bot status:", error);
        throw error;
    }
}

/**
 * Stop/remove bot from meeting
 */
export async function stopMeetingBot(botId: string): Promise<void> {
    console.log("Stopping bot:", botId);

    if (isMockMode() || !getApiKey() || botId.startsWith("mock-bot")) {
        return;
    }

    try {
        // Meeting BaaS typically uses DELETE or a specific end endpoint
        await fetch(`https://api.meetingbaas.com/bots/${botId}`, {
            method: "DELETE",
            headers: {
                "x-meeting-baas-api-key": getApiKey(),
            },
        });
    } catch (error) {
        console.error("Error stopping bot:", error);
    }
}

/**
 * Get recording URL from bot
 */
export async function getBotRecording(botId: string): Promise<string | null> {
    if (isMockMode() || !getApiKey() || botId.startsWith("mock-bot")) {
        return null;
    }

    try {
        // Fetch bot details which usually includes recording URL once completed
        const response = await fetch(`https://api.meetingbaas.com/bots/${botId}`, {
            headers: {
                "x-meeting-baas-api-key": getApiKey(),
            },
        });
        const data = await response.json();
        return data.mp4 || data.recording_url || null;
    } catch (error) {
        console.error("Error fetching bot recording:", error);
        return null;
    }
}

/**
 * Get transcript from bot
 */
export async function getBotTranscript(botId: string): Promise<any | null> {
    if (isMockMode() || !getApiKey() || botId.startsWith("mock-bot")) {
        return null;
    }

    try {
        // Meeting BaaS provides transcripts, usually available via webhook or a specific endpoint
        const response = await fetch(`https://api.meetingbaas.com/bots/${botId}/transcript`, {
            headers: {
                "x-meeting-baas-api-key": getApiKey(),
            },
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error("Error fetching bot transcript:", error);
        return null;
    }
}

/**
 * Parse meeting platform from URL
 */
export function detectMeetingPlatform(url: string): string {
    if (url.includes("meet.google.com")) return "google_meet";
    if (url.includes("zoom.us")) return "zoom";
    if (url.includes("teams.microsoft.com")) return "microsoft_teams";
    if (url.includes("webex.com")) return "webex";
    return "unknown";
}

/**
 * Validate meeting URL
 */
export function isValidMeetingUrl(url: string): boolean {
    const validPatterns = [
        /meet\.google\.com/,
        /zoom\.us\/j\//,
        /zoom\.us\/my\//,
        /teams\.microsoft\.com/,
        /webex\.com/,
    ];

    return validPatterns.some((pattern) => pattern.test(url));
}
