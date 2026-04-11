import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { google } from "googleapis";

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

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
        );

        const scopes = [
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar.events.readonly",
        ];

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
            state: userId,
            prompt: "consent",
        });

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error("Error generating auth URL:", error);
        return NextResponse.json(
            { error: "Failed to initialize Google Calendar auth" },
            { status: 500 }
        );
    }
}
