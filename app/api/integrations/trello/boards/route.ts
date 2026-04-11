import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

/**
 * GET /api/integrations/trello/boards
 * Get Trello boards
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        const integrationsList = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.integrationsCollectionId,
            [
                Query.equal("userId", user.$id),
                Query.equal("platform", "trello"),
                Query.limit(1)
            ]
        );
        const integration = integrationsList.total > 0 ? integrationsList.documents[0] : null;

        if (!integration) {
            return NextResponse.json({ error: "Trello not connected" }, { status: 404 });
        }

        // In production, call Trello API to get boards
        return NextResponse.json({ success: true, boards: [] });
    } catch (error) {
        console.error("Error fetching Trello boards:", error);
        return NextResponse.json(
            { error: "Failed to fetch boards" },
            { status: 500 }
        );
    }
}
