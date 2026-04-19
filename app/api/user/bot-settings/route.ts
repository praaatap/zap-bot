import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { databases } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { resolveAgentBotName } from "@/lib/bot-name";

/**
 * GET /api/user/bot-settings
 * Fetch bot settings for the user
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId) as any;

        return NextResponse.json({
            success: true,
            data: {
                botName: resolveAgentBotName(user),
                botImageUrl: user.botImageUrl || null,
                plan: user.currentPlan || "free",
            },
        });
    } catch (error) {
        console.error("Error fetching bot settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch bot settings" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/user/bot-settings
 * Update bot settings for the user
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId) as any;
        const body = await request.json();
        const { botImageUrl } = body;

        const updated = await databases.updateDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            user.$id,
            {
                botImageUrl: botImageUrl || user.botImageUrl,
            },
        );

        return NextResponse.json({
            success: true,
            data: {
                botName: resolveAgentBotName(updated),
                botImageUrl: updated.botImageUrl || null,
                plan: updated.currentPlan || "free",
            },
        });
    } catch (error) {
        console.error("Error updating bot settings:", error);
        return NextResponse.json(
            { error: "Failed to save bot settings" },
            { status: 500 }
        );
    }
}
