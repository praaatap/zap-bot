import { MeetingBaaSClient } from "@repo/meeting-baas";
import { store } from "../store.js";
import type { CalendarEvent, Meeting, MeetingPlatform } from "@repo/shared";
import { canUserSendBot, incrementMeetingUsage } from "./usage.js";

const client = new MeetingBaaSClient();
const MOCK_MODE = process.env.MEETING_BAAS_MOCK !== "false";

function simulateMockMeetingLifecycle(meetingId: string, title: string) {
    // Simulate bot lifecycle so frontend behaves like a real meeting pipeline in local/dev.
    setTimeout(() => {
        store.upsertMeeting({ id: meetingId, botStatus: "in_meeting" });
    }, 1500);

    setTimeout(() => {
        store.upsertMeeting({ id: meetingId, botStatus: "recording" });
    }, 3500);

    setTimeout(() => {
        const now = new Date();
        const transcriptEntries = [
            { speaker: "Host", text: `Starting ${title}.`, startTime: 0, endTime: 4 },
            { speaker: "Participant", text: "Can we confirm timeline and owner for this item?", startTime: 5, endTime: 11 },
            { speaker: "Host", text: "Yes, owner is assigned and deadline is next Friday.", startTime: 12, endTime: 19 },
            { speaker: "Participant", text: "Great, please share follow-up notes after the call.", startTime: 20, endTime: 26 },
        ];

        store.setTranscript({
            meetingId,
            language: "en",
            createdAt: now.toISOString(),
            entries: transcriptEntries,
        });

        store.upsertMeeting({
            id: meetingId,
            botStatus: "completed",
            endTime: now.toISOString(),
            duration: 26 * 60,
            summary:
                "Discussed timeline and ownership. Confirmed owner assignment and deadline for next Friday. Follow-up notes requested after the meeting.",
        });
    }, 8000);
}

function detectPlatformFromMeetingUrl(url: string): MeetingPlatform {
    if (url.includes("meet.google.com")) return "google_meet";
    if (url.includes("zoom.us")) return "zoom";
    if (url.includes("teams.microsoft.com")) return "teams";
    return "google_meet";
}

function buildMockBotResponse(meetingUrl: string) {
    return {
        id: `mock-bot-${Date.now()}`,
        status: "joining",
        meetingUrl,
        platform: detectPlatformFromMeetingUrl(meetingUrl),
        createdAt: new Date().toISOString(),
    };
}

async function sendBotToMeetingBaaS(payload: {
    meetingUrl: string;
    botName: string;
    meetingId: string;
    userId: string;
}) {
    // Check environment variables
    if (!process.env.MEETING_BAAS_API_KEY) {
        throw new Error("MEETING_BAAS_API_KEY environment variable is not set");
    }

    const webhookUrl = process.env.MEETING_BAAS_WEBHOOK_URL || "http://localhost:3001/api/webhooks/meeting-baas";

    const user = store.getUser(payload.userId);

    const requestBody = {
        meeting_url: payload.meetingUrl,
        bot_name: user?.botName || "Zap Bot",
        bot_image: user?.botImageUrl || undefined,
        reserved: false,
        recording_mode: "speaker_view",
        speech_to_text: { provider: "Default" },
        webhook_url: webhookUrl,
        extra: {
            meeting_id: payload.meetingId,
            user_id: payload.userId,
        },
    };

    console.log(`[sendBotToMeeting] Sending request to MeetingBaas:`);
    console.log(`  - Meeting URL: ${requestBody.meeting_url}`);
    console.log(`  - Bot Name: ${requestBody.bot_name}`);
    console.log(`  - Webhook URL: ${webhookUrl}`);

    const response = await fetch("https://api.meetingbaas.com/v2/bots", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MEETING_BAAS_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[sendBotToMeeting] API Error: ${response.status} - ${errorText}`);
        throw new Error(`MeetingBaas API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const botId = data.bot_id || data.data?.bot_id;
    console.log(`[sendBotToMeeting] Success! Bot ID: ${botId}`);
    return { ...data, bot_id: botId };
}

export async function dispatchBotForEvent(event: CalendarEvent): Promise<Meeting | null> {
    if (!event.meetingUrl) {
        console.log(`Skipping event "${event.summary}" because no meeting URL was found.`);
        return null;
    }

    const existing = store.getAllMeetings().find((m) => m.calendarEventId === event.id);
    if (existing && existing.botStatus !== "failed" && existing.botId) {
        console.log(`Bot already dispatched for event "${event.summary}"`);
        return existing;
    }

    // Try to find the user associated with this event
    const organizerEmail = event.organizer || (event.attendees && event.attendees[0]) || "";
    const user = store.getUserByEmail(organizerEmail);
    let botName = user?.botName || "Zap Bot";
    let userId = user?.id || "unknown";

    if (user) {
        const canDispatch = await canUserSendBot(user.id);
        if (!canDispatch.allowed) {
            console.log(`Skipping dispatch for "${event.summary}": ${canDispatch.reason}`);
            return null;
        }
        await incrementMeetingUsage(user.id);
    }

    // Pre-create the meeting in store to get an ID
    const meeting = store.upsertMeeting({
        calendarEventId: event.id,
        title: event.summary,
        platform: (event.platform || "google_meet") as MeetingPlatform,
        meetingUrl: event.meetingUrl,
        startTime: event.start,
        botStatus: "joining",
        participants: event.attendees,
    });

    try {
        if (MOCK_MODE) {
            const botId = `mock-bot-${Date.now()}`;
            store.upsertMeeting({
                id: meeting.id,
                botId: botId,
            });
            simulateMockMeetingLifecycle(meeting.id, meeting.title);
            return meeting;
        }

        const botResponse = await sendBotToMeetingBaaS({
            meetingUrl: event.meetingUrl,
            botName: botName,
            meetingId: meeting.id,
            userId: userId,
        });

        store.upsertMeeting({
            id: meeting.id,
            botId: botResponse.bot_id,
            botStatus: "joining",
        });

        return meeting;
    } catch (error) {
        console.error(`Failed to dispatch bot for "${event.summary}":`, error);

        return store.upsertMeeting({
            id: meeting.id,
            botStatus: "failed",
        });
    }
}

export async function dispatchBotForManualMeeting(input: {
    title: string;
    meetingUrl: string;
    startTime?: string;
    participants?: string[];
}): Promise<Meeting> {
    const platform = detectPlatformFromMeetingUrl(input.meetingUrl);

    // Pre-create the meeting in store to get an ID
    const meeting = store.upsertMeeting({
        title: input.title,
        platform,
        meetingUrl: input.meetingUrl,
        startTime: input.startTime || new Date().toISOString(),
        botStatus: "joining",
        participants: input.participants || [],
    });

    try {
        if (MOCK_MODE) {
            const botId = `mock-bot-${Date.now()}`;
            store.upsertMeeting({
                id: meeting.id,
                botId: botId,
            });
            simulateMockMeetingLifecycle(meeting.id, meeting.title);
            return meeting;
        }

        const botResponse = await sendBotToMeetingBaaS({
            meetingUrl: input.meetingUrl,
            botName: "Zap Bot",
            meetingId: meeting.id,
            userId: "manual",
        });

        store.upsertMeeting({
            id: meeting.id,
            botId: botResponse.bot_id,
            botStatus: "joining",
        });

        return meeting;
    } catch (error) {
        console.error(`Failed to dispatch manual bot for "${input.title}":`, error);
        return store.upsertMeeting({
            id: meeting.id,
            botStatus: "failed",
        });
    }
}

export async function removeBotFromMeeting(meetingId: string): Promise<void> {
    const meeting = store.getMeeting(meetingId);
    if (!meeting?.botId) {
        throw new Error("No bot found for this meeting");
    }

    try {
        await client.removeBot(meeting.botId);
    } catch (error) {
        if (!MOCK_MODE) throw error;
        console.warn("Remove bot failed in Meeting BaaS, ignored in mock mode:", error);
    }

    store.upsertMeeting({
        id: meetingId,
        botStatus: "completed",
    });
}
