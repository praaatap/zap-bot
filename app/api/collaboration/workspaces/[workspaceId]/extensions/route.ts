import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

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

        const { workspaceId } = await params;
        const user = await getOrCreateUser(userId);
        const body = await request.json();
        const {
            name,
            description,
            target,
            transport,
            status,
            subscribedEvents,
            secret,
        } = body ?? {};

        if (!name || !target || !transport || !Array.isArray(subscribedEvents)) {
            return NextResponse.json({ error: "name, target, transport, and subscribedEvents are required" }, { status: 400 });
        }

        if (!["webhook", "browser", "internal"].includes(transport)) {
            return NextResponse.json({ error: "Invalid transport" }, { status: 400 });
        }

        // Return mock extension for now
        return NextResponse.json({ 
            success: true, 
            data: {
                id: `ext-${Date.now()}`,
                workspaceId,
                name,
                description,
                target,
                transport,
                status: status === "paused" ? "paused" : "active",
                subscribedEvents,
                createdBy: user.id,
                createdAt: new Date().toISOString(),
            } 
        }, { status: 201 });
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

        const { workspaceId } = await params;

        // Return empty array for now
        return NextResponse.json({ success: true, data: [] });
    } catch (error) {
        console.error("Error fetching extensions:", error);
        return NextResponse.json(
            { error: "Failed to fetch extensions" },
            { status: 500 }
        );
    }
}
