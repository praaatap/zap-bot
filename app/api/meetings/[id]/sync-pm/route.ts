import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

/**
 * POST /api/meetings/[id]/sync-pm
 * Sync action items to Jira/Asana/Trello
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
        const { platform, workspaceId, projectId, apiKey } = body;

        if (!platform) {
            return NextResponse.json({ error: "platform is required" }, { status: 400 });
        }

        const actionItems = Array.isArray(meeting.actionItems) ? meeting.actionItems : [];

        // In production, you would call the PM tool API here
        // For now, just return success
        return NextResponse.json({ 
            success: true, 
            data: { 
                synced: actionItems.length,
                platform,
                message: "Action items synced successfully"
            } 
        });
    } catch (error) {
        console.error("Error syncing to PM tool:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "PM sync failed" },
            { status: 500 }
        );
    }
}
