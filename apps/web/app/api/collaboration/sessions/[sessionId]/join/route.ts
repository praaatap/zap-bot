import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

/**
 * POST /api/collaboration/sessions/[sessionId]/join
 * Join a session
 */
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;
        const user = await getOrCreateUser(userId);

        // Return mock session update for now
        return NextResponse.json({ 
            success: true, 
            data: {
                id: sessionId,
                activeUsers: [user.id],
                meetingId: "mock-meeting",
                workspaceId: "default",
            } 
        });
    } catch (error) {
        console.error("Error joining session:", error);
        return NextResponse.json(
            { error: "Failed to join session" },
            { status: 500 }
        );
    }
}
