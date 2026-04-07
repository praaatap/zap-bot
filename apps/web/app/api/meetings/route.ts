import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getObjectStorageProvider, isRecordingStoredInR2, resolveRecordingUrl } from "@/lib/aws";
import { getOrCreateUser } from "@/lib/user";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { databases, ID, Query } from "@/lib/appwrite.server";

function detectPlatformFromUrl(url?: string | null): string {
    if (!url) return "unknown";
    if (url.includes("meet.google.com")) return "google_meet";
    if (url.includes("zoom.us")) return "zoom";
    if (url.includes("teams.microsoft.com")) return "microsoft_teams";
    if (url.includes("webex.com")) return "webex";
    return "other";
}

function normalizeParticipants(attendees: unknown): string[] {
    if (!Array.isArray(attendees)) return [];
    return attendees
        .map((a: any) => (typeof a === "string" ? a : (a?.name || a?.email || "")))
        .filter((v: string) => Boolean(v));
}

async function serializeMeeting(meeting: any) {
    return {
        ...meeting,
        joinedConfirmed: Boolean(meeting.botJoinedAt),
        platform: detectPlatformFromUrl(meeting.meetingUrl),
        participants: normalizeParticipants(meeting.attendees),
        objectStorageProvider: getObjectStorageProvider(),
        recordingStoredInR2: isRecordingStoredInR2(meeting.recordingUrl),
        recordingStorageKey: meeting.recordingUrl,
        recordingUrl: await resolveRecordingUrl(meeting.recordingUrl),
    };
}

export async function GET(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        const { searchParams } = new URL(request.url);
        const scope = searchParams.get("scope"); // "past" | "upcoming" | null
        const compact = searchParams.get("compact") === "1";
        const takeParam = Number(searchParams.get("take") || 50);
        const take = Number.isFinite(takeParam) ? Math.max(1, Math.min(takeParam, 100)) : 50;
        const now = new Date();

        const query: string[] = [Query.equal("userId", user.$id), Query.limit(take)];
        query.push(Query.orderDesc("startTime"));

        const docs = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            query
        );

        let meetings = docs.documents as any[];

        if (scope === "past") {
            meetings = meetings.filter((m) => new Date(m.endTime) < now);
        } else if (scope === "upcoming") {
            meetings = meetings.filter((m) => new Date(m.startTime) >= now);
            meetings = meetings.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
        }

        if (compact) {
            meetings = meetings.map((m) => ({
                id: m.$id,
                title: m.title,
                startTime: m.startTime,
                endTime: m.endTime,
                botJoinedAt: m.botJoinedAt,
                transcriptReady: m.transcriptReady,
                recordingUrl: m.recordingUrl,
                summary: m.summary,
                attendees: m.attendees,
                meetingUrl: m.meetingUrl,
            }));
        } else {
            meetings = meetings.map((m) => ({ ...m, id: m.$id }));
        }

        const serializedMeetings = await Promise.all(
            meetings.map((meeting) => serializeMeeting(meeting))
        );

        return NextResponse.json(
            { success: true, data: serializedMeetings },
            { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } }
        );
    } catch (error) {
        console.error("Error fetching meetings:", error);
        return NextResponse.json(
            { error: "Failed to fetch meetings" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await getOrCreateUser(userId);

        const body = await request.json();
        const { title, meetingUrl, startTime, endTime, description } = body;

        // Create new meeting
        const meeting = await databases.createDocument(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            ID.unique(),
            {
                userId: user.$id,
                title: title || "Untitled Meeting",
                meetingUrl,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime || Date.now() + 3600000).toISOString(),
                description,
                botScheduled: true,
                botSent: false,
                meetingEnded: false,
                transcriptReady: false,
                processed: false,
                ragProcessed: false,
                emailSent: false,
            }
        );

        return NextResponse.json({ success: true, data: { ...meeting, id: meeting.$id } });
    } catch (error) {
        console.error("Error creating meeting:", error);
        return NextResponse.json(
            { error: "Failed to create meeting" },
            { status: 500 }
        );
    }
}
