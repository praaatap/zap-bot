import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

/**
 * GET /api/auth/status
 * Check if user is connected to Google Calendar
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        return NextResponse.json({
            success: true,
            data: {
                connected: user.calendarConnected,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Error fetching auth status:", error);
        return NextResponse.json(
            { error: "Failed to fetch auth status" },
            { status: 500 }
        );
    }
}
