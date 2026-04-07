import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

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

        const user = await getOrCreateUser(userId);

        // Return mock workspace for now
        return NextResponse.json({ 
            success: true, 
            data: [{
                id: "default",
                name: `${user.name || user.email}'s Workspace`,
                createdBy: user.id,
            }] 
        });
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        return NextResponse.json(
            { error: "Failed to fetch workspaces" },
            { status: 500 }
        );
    }
}
