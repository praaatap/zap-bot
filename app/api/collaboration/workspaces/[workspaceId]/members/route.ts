import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/collaboration/workspaces/[workspaceId]/members
 * List workspace members
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            data: [],
            featureAvailable: false,
            message: "Workspace membership is not configured in this deployment.",
        });
    } catch (error) {
        console.error("Error fetching workspace members:", error);
        return NextResponse.json(
            { error: "Failed to fetch members" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/collaboration/workspaces/[workspaceId]/members
 * Add or update a workspace member
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await request.json().catch(() => null);
        return NextResponse.json(
            { error: "Workspace membership is not configured in this deployment." },
            { status: 501 }
        );
    } catch (error) {
        console.error("Error adding workspace member:", error);
        return NextResponse.json(
            { error: "Failed to add member" },
            { status: 500 }
        );
    }
}
