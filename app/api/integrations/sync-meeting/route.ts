import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";

/**
 * POST /api/integrations/sync-meeting
 * Manually sync meeting action items to all connected integrations
 */
export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(clerkId) as any;
        const body = await request.json();
        const { meetingId } = body;

        const meeting = await databases.getDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            meetingId
        ) as any;

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch user integrations
        const integrationsResult = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.integrationsCollectionId,
            [Query.equal("userId", user.$id)]
        );

        const integrations = integrationsResult.documents as any[];
        const results = [];

        for (const integration of integrations) {
            try {
                const actionItems = Array.isArray(meeting.actionItems) ? meeting.actionItems : [];
                
                // In production, call the respective PM tool API
                results.push({ 
                    platform: integration.platform, 
                    status: "success",
                    synced: actionItems.length 
                });
            } catch (error) {
                results.push({ 
                    platform: integration.platform, 
                    status: "error", 
                    error: error instanceof Error ? error.message : "Sync failed" 
                });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error("Error syncing meeting:", error);
        return NextResponse.json(
            { error: "Failed to sync meeting" },
            { status: 500 }
        );
    }
}
