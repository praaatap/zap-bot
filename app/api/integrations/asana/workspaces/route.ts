import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

/**
 * GET /api/integrations/asana/workspaces
 * Get Asana workspaces
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
                Query.equal("platform", "asana"),
                Query.limit(1)
            ]
        );
        const integration = integrationsList.total > 0 ? integrationsList.documents[0] : null;

        if (!integration) {
            return NextResponse.json({ error: "Asana not connected" }, { status: 404 });
        }

        // In production, call Asana API to get workspaces
        return NextResponse.json({ success: true, workspaces: [] });
    } catch (error) {
        console.error("Error fetching Asana workspaces:", error);
        return NextResponse.json(
            { error: "Failed to fetch workspaces" },
            { status: 500 }
        );
    }
}
