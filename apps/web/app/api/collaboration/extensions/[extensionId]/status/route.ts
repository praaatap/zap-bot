import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

/**
 * PATCH /api/collaboration/extensions/[extensionId]/status
 * Update extension status
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ extensionId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { extensionId } = await params;
        const user = await getOrCreateUser(userId);
        const body = await request.json();
        const { status } = body ?? {};

        if (status !== "active" && status !== "paused") {
            return NextResponse.json({ error: "status must be active or paused" }, { status: 400 });
        }

        // Return mock extension update for now
        return NextResponse.json({ 
            success: true, 
            data: {
                id: extensionId,
                status,
            } 
        });
    } catch (error) {
        console.error("Error updating extension status:", error);
        return NextResponse.json(
            { error: "Failed to update extension status" },
            { status: 500 }
        );
    }
}
