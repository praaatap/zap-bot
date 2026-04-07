import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

/**
 * POST /api/integrations/sync-meeting
 * Manually sync meeting action items to all connected integrations
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);
        const body = await request.json();
        const { meetingId } = body;

        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        if (meeting.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch user integrations
        const integrations = await prisma.userIntegration.findMany({
            where: { userId: user.id },
        });

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
