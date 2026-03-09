import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import { getOrCreateUser } from "@/lib/user";

export async function GET() {
    try {
        if (!process.env.DATABASE_URL) {
            return NextResponse.json(
                { error: "Server not configured: missing DATABASE_URL" },
                { status: 503 }
            );
        }

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return NextResponse.json(
                { error: "Server not configured: missing Google OAuth credentials" },
                { status: 503 }
            );
        }

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        // Check if user has connected Google Calendar
        if (!user.calendarConnected || !user.googleAccessToken) {
            return NextResponse.json({
                success: true,
                connected: false,
                data: [],
            });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`
        );

        // Set credentials
        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken,
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        // Fetch events from the next 7 days
        const timeMin = new Date();
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 7);

        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 50,
        });

        const events = response.data.items || [];

        // Extract meeting URLs from event descriptions and conferencing data
        const processedEvents = events.map((event: any) => {
            let meetingUrl =
                event.hangoutLink ||
                event.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === "video")?.uri;

            // Try to extract meeting URLs from description
            if (!meetingUrl && event.description) {
                const urlRegex = /(https?:\/\/[^\s]+(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com)[^\s]*)/gi;
                const matches = event.description.match(urlRegex);
                if (matches) {
                    meetingUrl = matches[0];
                }
            }

            return {
                id: event.id,
                title: event.summary || "Untitled Event",
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                meetingUrl,
                attendees: event.attendees?.map((a: any) => a.email).filter(Boolean) || [],
                organizer: event.organizer?.email,
                description: event.description,
            };
        });

        // Filter only events with meeting URLs
        const meetingEvents = processedEvents.filter((e: any) => e.meetingUrl);

        return NextResponse.json({
            success: true,
            connected: true,
            data: meetingEvents,
        });
    } catch (error) {
        console.error("Error fetching calendar events:", error);

        // If token expired, return with connected=false
        if (error && typeof error === 'object' && 'message' in error && 
            typeof error.message === 'string' && error.message.includes("invalid_grant")) {
            return NextResponse.json({
                success: true,
                connected: false,
                data: [],
                error: "Calendar connection expired. Please reconnect.",
            });
        }

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to fetch calendar events",
            },
            { status: 500 }
        );
    }
}
