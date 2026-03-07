import { MeetingBaaSClient } from "@repo/meeting-baas";
import { store } from "../store.js";
import type { CalendarEvent, Meeting, MeetingPlatform } from "@repo/shared";

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

async function sendBotWithFallback(payload: {
    meetingUrl: string;
    botName: string;
    entryMessage: string;
    recording: { mode: "speaker_view" };
    transcription: { enabled: true; language: string };
    webhookUrl: string;
}) {
    try {
        return await client.sendBot(payload);
    } catch (error) {
        if (MOCK_MODE) {
            console.warn("Meeting BaaS unavailable, using mock bot response:", error);
            return buildMockBotResponse(payload.meetingUrl);
        }
        throw error;
    }
}

export async function dispatchBotForEvent(event: CalendarEvent): Promise<Meeting | null> {
    if (!event.meetingUrl) {
        console.log(`Skipping event \"${event.summary}\" because no meeting URL was found.`);
        return null;
    }

    const existing = store.getAllMeetings().find((m) => m.calendarEventId === event.id);
    if (existing && existing.botStatus !== "failed") {
        console.log(`Bot already dispatched for event \"${event.summary}\"`);
        return existing;
    }

    try {
        const botResponse = await sendBotWithFallback({
            meetingUrl: event.meetingUrl,
            botName: "Zap Bot",
            entryMessage: "Zap Bot has joined to record and transcribe this meeting.",
            recording: { mode: "speaker_view" },
            transcription: { enabled: true, language: "en" },
            webhookUrl:
                process.env.MEETING_BAAS_WEBHOOK_URL ||
                "http://localhost:3001/api/webhooks/meeting-baas",
        });

        const meeting = store.upsertMeeting({
            calendarEventId: event.id,
            title: event.summary,
            platform: (event.platform || "google_meet") as MeetingPlatform,
            meetingUrl: event.meetingUrl,
            startTime: event.start,
            botId: botResponse.id,
            botStatus: "joining",
            participants: event.attendees,
        });

        if (MOCK_MODE && String(botResponse.id).startsWith("mock-bot-")) {
            simulateMockMeetingLifecycle(meeting.id, meeting.title);
        }

        return meeting;
    } catch (error) {
        console.error(`Failed to dispatch bot for \"${event.summary}\":`, error);

        return store.upsertMeeting({
            calendarEventId: event.id,
            title: event.summary,
            platform: (event.platform || "google_meet") as MeetingPlatform,
            meetingUrl: event.meetingUrl,
            startTime: event.start,
            botStatus: "failed",
            participants: event.attendees,
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

    const botResponse = await sendBotWithFallback({
        meetingUrl: input.meetingUrl,
        botName: "Zap Bot",
        entryMessage: "Zap Bot has joined to transcribe and provide live suggestions.",
        recording: { mode: "speaker_view" },
        transcription: { enabled: true, language: "en" },
        webhookUrl:
            process.env.MEETING_BAAS_WEBHOOK_URL ||
            "http://localhost:3001/api/webhooks/meeting-baas",
    });

    const meeting = store.upsertMeeting({
        title: input.title,
        platform,
        meetingUrl: input.meetingUrl,
        startTime: input.startTime || new Date().toISOString(),
        botId: botResponse.id,
        botStatus: "joining",
        participants: input.participants || [],
    });

    if (MOCK_MODE && String(botResponse.id).startsWith("mock-bot-")) {
        simulateMockMeetingLifecycle(meeting.id, meeting.title);
    }

    return meeting;
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
