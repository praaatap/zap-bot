import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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

        await params;
        await request.json().catch(() => null);
        return NextResponse.json(
            { error: "Workspace extensions are not configured in this deployment." },
            { status: 501 }
        );
    } catch (error) {
        console.error("Error updating extension status:", error);
        return NextResponse.json(
            { error: "Failed to update extension status" },
            { status: 500 }
        );
    }
}
