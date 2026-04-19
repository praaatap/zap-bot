import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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
        const { type } = body ?? {};

        if (!type || typeof type !== "string") {
            return NextResponse.json({ error: "type is required" }, { status: 400 });
        }

        if (!ASSISTANT_EVENT_TYPES.has(type)) {
            return NextResponse.json({ error: "Unsupported event type" }, { status: 400 });
        }

        return NextResponse.json(
            { error: `Event publishing for "${type}" is not configured in this deployment.` },
            { status: 501 }
        );
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

        return NextResponse.json({
            success: true,
            data: [],
            featureAvailable: false,
            message: "Collaboration events are not configured in this deployment.",
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}
