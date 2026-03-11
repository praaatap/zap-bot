import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

function detectPlatformFromUrl(url?: string): string {
    if (!url) return "unknown";
    
    if (url.includes("meet.google.com")) return "google_meet";
    if (url.includes("zoom.us")) return "zoom";
    if (url.includes("teams.microsoft.com")) return "microsoft_teams";
    if (url.includes("webex.com")) return "webex";
    
    return "other";
}

export async function GET(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const source = searchParams.get("source") || "all";
        const query = searchParams.get("q")?.trim() || "";

        const user = await getOrCreateUser(userId);

        // Get upcoming meetings (next 30 days) that don't have recordings yet
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const whereClause: any = {
            userId: user.id,
            startTime: {
                gte: new Date(),
                lte: thirtyDaysFromNow,
            },
            recordingUrl: null,
        };

        if (source === "calendar") {
            whereClause.isFromCalendar = true;
        }

        if (source === "manual") {
            whereClause.isFromCalendar = false;
        }

        if (query) {
            whereClause.OR = [
                { title: { contains: query, mode: "insensitive" } },
                { meetingUrl: { contains: query, mode: "insensitive" } },
            ];
        }

        const upcomingRecordings = await prisma.meeting.findMany({
            where: {
                ...whereClause,
            },
            select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                meetingUrl: true,
                attendees: true,
                botScheduled: true,
                botSent: true,
                botId: true,
                isFromCalendar: true,
            },
            orderBy: {
                startTime: "asc",
            },
            take: 10,
        });

        // Transform data to include platform detection
        const transformedRecordings = upcomingRecordings.map((meeting) => ({
            ...meeting,
            platform: detectPlatformFromUrl(meeting.meetingUrl || undefined),
            participants: Array.isArray(meeting.attendees) 
                ? meeting.attendees.map((a: any) => typeof a === 'string' ? a : a.email || '')
                : [],
        }));

        return NextResponse.json(
            {
                success: true,
                data: transformedRecordings,
                meta: {
                    source,
                    query,
                    count: transformedRecordings.length,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching upcoming recordings:", error);
        return NextResponse.json(
            { error: "Failed to fetch upcoming recordings" },
            { status: 500 }
        );
    }
}
