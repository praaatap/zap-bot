import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

/**
 * GET /api/calendar/events
 * Fetch upcoming calendar events
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        // Return demo calendar events for users without calendar connected
        const demoEvents = [
            {
                id: "cal-001",
                summary: "Weekly Team Standup",
                start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
                end: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
                meetingUrl: "https://meet.google.com/abc-defg-hij",
                platform: "google_meet" as const,
                attendees: ["alice@company.com", "bob@company.com"],
                organizer: "alice@company.com",
            },
            {
                id: "cal-002",
                summary: "Product Design Review",
                start: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
                end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                meetingUrl: "https://zoom.us/j/987654321",
                platform: "zoom" as const,
                attendees: ["diana@company.com", "eric@company.com"],
                organizer: "diana@company.com",
            },
            {
                id: "cal-003",
                summary: "Client Sync",
                start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
                meetingUrl: "https://teams.microsoft.com/l/meetup-join/xyz",
                platform: "teams" as const,
                attendees: ["grace@client.com"],
                organizer: user.email,
            },
        ];

        return NextResponse.json({ success: true, data: demoEvents });
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch calendar events" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/calendar/sync
 * Sync calendar and dispatch bots for upcoming meetings
 */
export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        // In production, you would sync with Google Calendar here
        // For now, return success
        return NextResponse.json({
            success: true,
            data: {
                synced: 0,
                botsDispatched: 0,
                meetingIds: [],
            },
        });
    } catch (error) {
        console.error("Calendar sync error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Calendar sync failed" },
            { status: 500 }
        );
    }
}
