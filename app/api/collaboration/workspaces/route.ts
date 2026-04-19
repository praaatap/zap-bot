import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET /api/collaboration/workspaces
 * List workspaces for a user
 * Note: Workspaces are not yet implemented in the Prisma schema
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            data: [],
            featureAvailable: false,
            message: "Collaboration workspaces are not configured in this deployment.",
        });
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        return NextResponse.json(
            { error: "Failed to fetch workspaces" },
            { status: 500 }
        );
    }
}
