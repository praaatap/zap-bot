import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/collaboration/workspaces/[workspaceId]/extensions
 * Register assistant extension hooks
 * Note: Extensions are not yet implemented in the Prisma schema
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

        await params;
        await request.json().catch(() => null);
        return NextResponse.json(
            { error: "Workspace extensions are not configured in this deployment." },
            { status: 501 }
        );
    } catch (error) {
        console.error("Error creating extension:", error);
        return NextResponse.json(
            { error: "Failed to create extension" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/collaboration/workspaces/[workspaceId]/extensions
 * List workspace extensions
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

        await params;
        return NextResponse.json({
            success: true,
            data: [],
            featureAvailable: false,
            message: "Workspace extensions are not configured in this deployment.",
        });
    } catch (error) {
        console.error("Error fetching extensions:", error);
        return NextResponse.json(
            { error: "Failed to fetch extensions" },
            { status: 500 }
        );
    }
}
