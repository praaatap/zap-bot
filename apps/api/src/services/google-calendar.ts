import { google } from "googleapis";
import type { CalendarEvent, MeetingPlatform } from "@repo/shared";

// ── OAuth2 Client ──────────────────────────────────────────────────

function getOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/auth/google/callback"
    );
}

/**
 * Generate Google OAuth consent URL
 */
export function getAuthUrl(): string {
    const client = getOAuth2Client();
    return client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
    });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokens(code: string): Promise<{
    access_token?: string | null;
    refresh_token?: string | null;
}> {
    const client = getOAuth2Client();
    const { tokens } = await client.getToken(code);
    return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
    };
}

/**
 * List upcoming calendar events
 */
export async function listEvents(
    accessToken: string,
    refreshToken: string
): Promise<CalendarEvent[]> {
    const client = getOAuth2Client();
    client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: client });
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: now.toISOString(),
        timeMax: oneWeekLater.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 50,
    });

    const events = response.data.items || [];

    return events.map((event): CalendarEvent => ({
        id: event.id || "",
        summary: event.summary || "Untitled Event",
        description: event.description || undefined,
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
        meetingUrl: extractMeetingUrl(event),
        platform: detectPlatform(extractMeetingUrl(event)),
        attendees: event.attendees?.map((a) => a.email || "").filter(Boolean),
        organizer: event.organizer?.email,
    }));
}

/**
 * Extract meeting URLs from events and enrich them
 */
export function extractMeetingLinks(events: CalendarEvent[]): CalendarEvent[] {
    return events.map((event) => ({
        ...event,
        platform: event.meetingUrl ? detectPlatform(event.meetingUrl) : undefined,
    }));
}

// ── Helpers ────────────────────────────────────────────────────────

function extractMeetingUrl(event: { hangoutLink?: string | null; description?: string | null; location?: string | null; conferenceData?: { entryPoints?: Array<{ uri?: string | null }> } }): string | undefined {
    // Check hangout/meet link
    if (event.hangoutLink) return event.hangoutLink;

    // Check conference data
    const videoEntry = event.conferenceData?.entryPoints?.find(
        (ep) => ep.uri && (ep.uri.includes("meet.google.com") || ep.uri.includes("zoom.us") || ep.uri.includes("teams.microsoft.com"))
    );
    if (videoEntry?.uri) return videoEntry.uri;

    // Check description and location for meeting URLs
    const text = `${event.description || ""} ${event.location || ""}`;
    const urlMatch = text.match(
        /https:\/\/(meet\.google\.com\/[a-z-]+|zoom\.us\/j\/\d+|teams\.microsoft\.com\/l\/meetup-join\/[^\s]+)/i
    );
    return urlMatch ? urlMatch[0] : undefined;
}

function detectPlatform(url?: string): MeetingPlatform | undefined {
    if (!url) return undefined;
    if (url.includes("meet.google.com")) return "google_meet";
    if (url.includes("zoom.us")) return "zoom";
    if (url.includes("teams.microsoft.com")) return "teams";
    return undefined;
}
