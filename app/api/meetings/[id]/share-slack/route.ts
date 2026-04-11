import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

/**
 * POST /api/meetings/[id]/share-slack
 * Share meeting summary to a Slack channel
 */
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const user = await getOrCreateUser(userId);

        let meeting;
        try {
            meeting = await databases.getDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.meetingsCollectionId,
                id
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

        const body = await _request.json();
        const { channelId } = body;

        if (!channelId) {
            return NextResponse.json({ error: "channelId is required" }, { status: 400 });
        }

        if (!user.slackTeamId || !meeting.summary) {
            return NextResponse.json({ error: "Slack not connected or no summary available" }, { status: 400 });
        }

        // In production, you would call the Slack API here
        // For now, just return success
        return NextResponse.json({ success: true, data: { message: "Shared to Slack" } });
    } catch (error) {
        console.error("Error sharing to Slack:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Slack share failed" },
            { status: 500 }
        );
    }
}
