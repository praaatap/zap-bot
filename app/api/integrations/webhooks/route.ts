import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { databases, Query, ID } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";

/**
 * POST /api/integrations/webhooks
 * Save webhook settings for the current user
 */
export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { webhookUrl, deliveryMode } = body;

        if (!webhookUrl) {
            return NextResponse.json(
                { error: "Webhook URL is required" },
                { status: 400 }
            );
        }

        const user = await getOrCreateUser(userId);

        // Check if webhook integration already exists
        const existing = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.integrationsCollectionId,
            [
                Query.equal("userId", user.$id),
                Query.equal("integrationId", "webhooks"),
                Query.limit(1),
            ],
        );

        if (existing.total > 0) {
            // Update existing webhook settings
            await databases.updateDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.integrationsCollectionId,
                existing.documents[0].$id,
                {
                    webhookUrl,
                    deliveryMode,
                    connected: true,
                    lastSynced: new Date().toISOString(),
                },
            );
        } else {
            // Create new webhook integration
            await databases.createDocument(
                APPWRITE_IDS.databaseId,
                APPWRITE_IDS.integrationsCollectionId,
                ID.unique(),
                {
                    userId: user.$id,
                    integrationId: "webhooks",
                    webhookUrl,
                    deliveryMode,
                    connected: true,
                    lastSynced: new Date().toISOString(),
                },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Webhook settings saved successfully",
        });
    } catch (error) {
        console.error("Error saving webhook settings:", error);
        return NextResponse.json(
            { error: "Failed to save webhook settings" },
            { status: 500 }
        );
    }
}
