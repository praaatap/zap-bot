import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

        const integration = await prisma.userIntegration.findFirst({
            where: { userId: user.id, platform: "trello" },
        });

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
