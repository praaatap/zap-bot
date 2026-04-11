import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.redirect("/sign-in");
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

        if (!process.env.APPWRITE_DATABASE_ID) {
            return NextResponse.redirect(
                `${appUrl}/dashboard/calendar?error=server_not_configured&details=missing_appwrite_id`
            );
        }

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return NextResponse.redirect(
                `${appUrl}/dashboard/calendar?error=missing_credentials`
            );
        }

        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/calendar/callback`;

        const scopes = [
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar.events.readonly",
        ].join(" ");

        const authParams = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: scopes,
            state: userId,
            access_type: "offline",
            prompt: "consent",
        });

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error("Error generating auth URL:", error);
        return NextResponse.json(
            { error: "Failed to initialize Google Calendar auth" },
            { status: 500 }
        );
    }
}
