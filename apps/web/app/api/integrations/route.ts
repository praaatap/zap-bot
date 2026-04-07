import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

/**
 * GET /api/integrations
 * Get all connected integrations for the current user
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        // Fetch integrations from UserIntegration model
        const { prisma } = await import("@/lib/prisma");
        const integrations = await prisma.userIntegration.findMany({
            where: { userId: user.id },
        });

        return NextResponse.json({ success: true, integrations });
    } catch (error) {
        console.error("Error fetching integrations:", error);
        return NextResponse.json(
            { error: "Failed to fetch integrations" },
            { status: 500 }
        );
    }
}
