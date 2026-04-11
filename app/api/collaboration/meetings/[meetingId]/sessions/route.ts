import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

/**
 * POST /api/collaboration/meetings/[meetingId]/sessions
 * Start an AI meeting copilot session for multiple users
 * Note: Sessions are not yet implemented in the Prisma schema
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ meetingId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { meetingId } = await params;
        const user = await getOrCreateUser(userId);
        const body = await request.json();
        const { workspaceId, contextPrompt } = body ?? {};

        let meeting;
        try {
            meeting = await databases.getDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                meetingId
            );
        } catch (error) {
            meeting = null;
        }

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Return mock session for now
        return NextResponse.json({ 
            success: true, 
            data: {
                id: `session-${Date.now()}`,
                meetingId,
                workspaceId: workspaceId || "default",
                createdBy: user.$id,
                status: "active",
                contextPrompt: typeof contextPrompt === "string" ? contextPrompt : undefined,
                activeUsers: [user.$id],
                createdAt: new Date().toISOString(),
            } 
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/collaboration/meetings/[meetingId]/sessions
 * List sessions for a meeting
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ meetingId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { meetingId } = await params;
        const user = await getOrCreateUser(userId);

        let meeting;
        try {
            meeting = await databases.getDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                meetingId
            );
        } catch (error) {
            meeting = null;
        }

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Return empty array for now
        return NextResponse.json({ success: true, data: [] });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}
