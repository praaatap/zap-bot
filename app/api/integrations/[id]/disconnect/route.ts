import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

/**
 * POST /api/integrations/[id]/disconnect
 * Disconnect an integration for the current user
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const integrationId = params.id;
        const user = await getOrCreateUser(userId);

        // Find existing integration
        const existing = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.integrationsCollectionId,
            [
                Query.equal("userId", user.$id),
                Query.equal("integrationId", integrationId),
                Query.limit(1),
            ],
        );

        if (existing.total > 0) {
            // Update to disconnected
            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.integrationsCollectionId,
                existing.documents[0].$id,
                {
                    connected: false,
                    lastSynced: null,
                },
            );
        }

        // Update user document with integration status
        const userUpdates: Record<string, any> = {};
        if (integrationId === "calendar") {
            userUpdates.calendarConnected = false;
        } else if (integrationId === "slack") {
            userUpdates.slackConnected = false;
        }

        if (Object.keys(userUpdates).length > 0) {
            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.usersCollectionId,
                user.$id,
                userUpdates,
            );
        }

        return NextResponse.json({
            success: true,
            message: `Successfully disconnected ${integrationId}`,
        });
    } catch (error) {
        console.error(`Error disconnecting integration ${params.id}:`, error);
        return NextResponse.json(
            { error: "Failed to disconnect integration" },
            { status: 500 }
        );
    }
}
