import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

/**
 * GET /api/auth/google
 * Google OAuth connection endpoint
 * Note: OAuth flow is handled by Clerk or a separate OAuth provider
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get("code");

        // If code exists, this is the callback
        if (code) {
            // In production, exchange code for tokens here
            // For now, just mark calendar as connected
            const user = await getOrCreateUser(userId);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    calendarConnected: true,
                },
            });

            // Redirect back to frontend dashboard
            const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            return NextResponse.redirect(`${frontendUrl}/dashboard?connected=true`);
        }

        // Return OAuth URL info (in production, generate actual OAuth URL)
        return NextResponse.json({ 
            success: true, 
            data: { 
                url: "https://accounts.google.com/o/oauth2/v2/auth",
                message: "OAuth URL would be generated here"
            } 
        });
    } catch (error) {
        console.error("Error in Google OAuth:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "OAuth failed" },
            { status: 500 }
        );
    }
}
