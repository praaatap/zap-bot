import { NextResponse, NextRequest } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { google } from "googleapis";
import { getOrCreateUser } from "@/lib/user";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    try {
        if (!process.env.DATABASE_URL) {
            return NextResponse.redirect(
                `${appUrl}/dashboard/calendar?error=server_not_configured&details=missing_database_url`
            );
        }

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            console.error("Missing Google OAuth credentials in environment");
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

        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get("code");
        const state = searchParams.get("state"); // This is the userId
        const error = searchParams.get("error");

        // Handle Google OAuth errors
        if (error) {
            console.error("Google OAuth error:", error);
            return NextResponse.redirect(
                `${appUrl}/dashboard/calendar?error=google_auth_error&details=${error}`
            );
        }

        if (!code || !state) {
            console.error("Missing code or state in callback");
            return NextResponse.redirect(
                `${appUrl}/dashboard/calendar?error=missing_params`
            );
        }

        // Exchange code for tokens
        let tokens;
        try {
            const response = await oauth2Client.getToken(code);
            tokens = response.tokens;
        } catch (tokenError) {
            console.error("Error exchanging token:", tokenError);
            return NextResponse.redirect(
                `${appUrl}/dashboard/calendar?error=token_exchange_failed`
            );
        }

        if (!tokens.access_token) {
            console.error("No access token received from Google");
            return NextResponse.redirect(
                `${appUrl}/dashboard/calendar?error=no_token`
            );
        }

        // Update user with tokens
        const user = await getOrCreateUser(state);

        await databases.updateDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.usersCollectionId,
            user.$id,
            {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token || user.googleRefreshToken,
                googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
                calendarConnected: true,
            },
        );

        console.log("Calendar connected successfully for user:", user.$id);
        return NextResponse.redirect(
            `${appUrl}/dashboard/calendar?success=true`
        );
    } catch (error) {
        console.error("Error processing calendar callback:", error);
        const details = encodeURIComponent(error instanceof Error ? error.message : "unknown");
        return NextResponse.redirect(
            `${appUrl}/dashboard/calendar?error=callback_failed&details=${details}`
        );
    }
}
