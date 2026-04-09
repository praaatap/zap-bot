import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

/**
 * GET /api/integrations
 * Get all connected integrations for the current user
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        // Fetch integrations from integrations collection
        const result = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.integrationsCollectionId,
            [
                Query.equal("userId", user.$id),
            ],
        );

        return NextResponse.json({ success: true, integrations: result.documents });
    } catch (error) {
        console.error("Error fetching integrations:", error);
        return NextResponse.json(
            { error: "Failed to fetch integrations" },
            { status: 500 }
        );
    }
}
