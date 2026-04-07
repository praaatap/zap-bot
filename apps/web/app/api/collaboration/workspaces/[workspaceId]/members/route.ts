import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

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

        const { workspaceId } = await params;
        const user = await getOrCreateUser(userId);

        // Return mock members for now
        return NextResponse.json({ 
            success: true, 
            data: [{
                id: "member-1",
                workspaceId,
                userId: user.id,
                role: "owner",
                user: { id: user.id, name: user.name, email: user.email },
            }] 
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

        const { workspaceId } = await params;
        const user = await getOrCreateUser(userId);
        const body = await request.json();
        const { userId: targetUserId, role } = body ?? {};

        if (!targetUserId || typeof targetUserId !== "string") {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        // Return mock member for now
        return NextResponse.json({ 
            success: true, 
            data: {
                id: `member-${Date.now()}`,
                workspaceId,
                userId: targetUserId,
                role: role || "member",
                invitedBy: user.id,
            } 
        }, { status: 201 });
    } catch (error) {
        console.error("Error adding workspace member:", error);
        return NextResponse.json(
            { error: "Failed to add member" },
            { status: 500 }
        );
    }
}
