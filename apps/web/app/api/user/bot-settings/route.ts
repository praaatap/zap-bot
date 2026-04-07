import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

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

        const user = await getOrCreateUser(userId);

        return NextResponse.json({
            success: true,
            data: {
                botName: user.botName || "Zap Bot",
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

        const user = await getOrCreateUser(userId);
        const body = await request.json();
        const { botName, botImageUrl } = body;

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                botName: botName || user.botName,
                botImageUrl: botImageUrl || user.botImageUrl,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                botName: updated.botName || "Zap Bot",
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
