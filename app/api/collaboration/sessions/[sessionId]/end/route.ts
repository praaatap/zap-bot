import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/collaboration/sessions/[sessionId]/end
 * End a session
 */
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await params;
        return NextResponse.json(
            { error: "Collaboration sessions are not configured in this deployment." },
            { status: 501 }
        );
    } catch (error) {
        console.error("Error ending session:", error);
        return NextResponse.json(
            { error: "Failed to end session" },
            { status: 500 }
        );
    }
}
