import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

const ASSISTANT_EVENT_TYPES = new Set([
    "bot.joining",
    "bot.joined",
    "bot.left",
    "meeting.started",
    "meeting.completed",
    "transcription.ready",
    "recording.ready",
    "bot.transcript",
    "meeting.shared",
    "session.started",
    "session.user_joined",
    "session.user_left",
    "session.ended",
    "chat.message",
]);

/**
 * POST /api/collaboration/events/publish
 * Publish event to extension subscribers
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { type, actorUserId, meetingId, workspaceId, sessionId, payload } = body ?? {};

        if (!type || typeof type !== "string") {
            return NextResponse.json({ error: "type is required" }, { status: 400 });
        }

        if (!ASSISTANT_EVENT_TYPES.has(type)) {
            return NextResponse.json({ error: "Unsupported event type" }, { status: 400 });
        }

        // In production, you would dispatch the event to extension subscribers
        // For now, just return success
        return NextResponse.json({ 
            success: true, 
            data: { 
                eventId: `evt_${Date.now()}`,
                type,
                published: true
            } 
        });
    } catch (error) {
        console.error("Error publishing event:", error);
        return NextResponse.json(
            { error: "Failed to publish event" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/collaboration/events
 * List assistant events with optional filters
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const workspaceId = searchParams.get("workspaceId") || undefined;
        const meetingId = searchParams.get("meetingId") || undefined;
        const sessionId = searchParams.get("sessionId") || undefined;

        // For now, return empty array as we don't have a persistent event store
        return NextResponse.json({ success: true, data: [] });
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}
