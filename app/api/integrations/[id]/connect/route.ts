import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query, ID } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

/**
 * POST /api/integrations/[id]/connect
 * Connect an integration for the current user
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

        // Check if integration already exists
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
            // Update existing integration
            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.integrationsCollectionId,
                existing.documents[0].$id,
                {
                    connected: true,
                    lastSynced: new Date().toISOString(),
                },
            );
        } else {
            // Create new integration
            await databases.createDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.integrationsCollectionId,
                ID.unique(),
                {
                    userId: user.$id,
                    integrationId,
                    connected: true,
                    lastSynced: new Date().toISOString(),
                },
            );
        }

        // Update user document with integration status
        const userUpdates: Record<string, any> = {};
        if (integrationId === "calendar") {
            userUpdates.calendarConnected = true;
        } else if (integrationId === "slack") {
            userUpdates.slackConnected = true;
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
            message: `Successfully connected ${integrationId}`,
        });
    } catch (error) {
        console.error(`Error connecting integration ${params.id}:`, error);
        return NextResponse.json(
            { error: "Failed to connect integration" },
            { status: 500 }
        );
    }
}
