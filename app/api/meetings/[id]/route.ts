import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";
import {
    getObjectStorageProvider,
    invokeMeetingProcessor,
    isRecordingStoredInR2,
    resolveRecordingUrl,
} from "@/lib/aws";
import { extractTranscriptEntries, maybeParseJson } from "@/lib/transcript";

type MeetingHighlight = {
    type: string;
    text: string;
    timestamp: number;
};

function detectPlatformFromUrl(url?: string | null): string {
    if (!url) return "unknown";
    if (url.includes("meet.google.com")) return "google_meet";
    if (url.includes("zoom.us")) return "zoom";
    if (url.includes("teams.microsoft.com")) return "microsoft_teams";
    if (url.includes("webex.com")) return "webex";
    return "other";
}

function normalizeParticipants(primary: unknown, fallback?: unknown): string[] {
    const source = Array.isArray(primary) && primary.length > 0
        ? primary
        : Array.isArray(fallback)
            ? fallback
            : [];

    return source
        .map((item: any) => {
            if (typeof item === "string") return item.trim();
            if (typeof item?.name === "string") return item.name.trim();
            if (typeof item?.email === "string") return item.email.trim();
            return "";
        })
        .filter(Boolean);
}

function normalizeActionItems(raw: unknown): string[] {
    const parsed = maybeParseJson(raw);

    if (typeof parsed === "string") {
        return parsed.trim() ? [parsed.trim()] : [];
    }

    if (Array.isArray(parsed)) {
        return parsed
            .map((item: any) => {
                if (typeof item === "string") return item.trim();
                if (typeof item?.text === "string") return item.text.trim();
                if (typeof item?.title === "string") return item.title.trim();
                if (typeof item?.action === "string") return item.action.trim();
                return "";
            })
            .filter(Boolean);
    }

    if (parsed && typeof parsed === "object") {
        return Object.values(parsed as Record<string, unknown>)
            .map((item: any) => {
                if (typeof item === "string") return item.trim();
                if (typeof item?.text === "string") return item.text.trim();
                if (typeof item?.title === "string") return item.title.trim();
                if (typeof item?.action === "string") return item.action.trim();
                return "";
            })
            .filter(Boolean);
    }

    return [];
}

function normalizeHighlights(raw: unknown): MeetingHighlight[] {
    const parsed = maybeParseJson(raw);

    if (Array.isArray(parsed)) {
        return parsed
            .map((item: any) => {
                if (typeof item === "string") {
                    return item.trim()
                        ? { type: "insight", text: item.trim(), timestamp: 0 }
                        : null;
                }

                const text = typeof item?.text === "string"
                    ? item.text.trim()
                    : typeof item?.title === "string"
                        ? item.title.trim()
                        : "";

                if (!text) return null;

                const timestamp = typeof item?.timestamp === "number"
                    ? item.timestamp
                    : typeof item?.startTime === "number"
                        ? item.startTime
                        : 0;

                return {
                    type: typeof item?.type === "string" && item.type.trim() ? item.type.trim() : "insight",
                    text,
                    timestamp: Math.max(0, timestamp),
                };
            })
            .filter((item): item is MeetingHighlight => Boolean(item));
    }

    return [];
}

function normalizeBotStatus(meeting: any): string {
    const status = String(meeting.botStatus || meeting.processingStatus || "").toLowerCase().trim();
    if (["pending", "joining", "in_meeting", "recording", "processing", "completed", "failed"].includes(status)) {
        return status;
    }

    if (meeting.processingError) return "failed";
    if (meeting.processed && meeting.ragProcessed) return "completed";
    if (meeting.transcriptReady || meeting.meetingEnded || meeting.recordingUrl) return "processing";
    if (meeting.botJoinedAt) return "in_meeting";
    if (meeting.botSent) return "joining";
    if (meeting.botScheduled) return "pending";
    return "pending";
}

async function serializeMeeting(meeting: any) {
    const transcriptEntries = extractTranscriptEntries(meeting.transcript);
    const recordingUrl = await resolveRecordingUrl(meeting.recordingUrl);
    const duration = meeting.endTime && meeting.startTime
        ? Math.max(0, Math.floor((new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / 1000))
        : 0;

    return {
        ...meeting,
        id: meeting.$id,
        platform: meeting.platform || detectPlatformFromUrl(meeting.meetingUrl),
        participants: normalizeParticipants(meeting.participants, meeting.attendees),
        joinedConfirmed: Boolean(meeting.botJoinedAt),
        objectStorageProvider: getObjectStorageProvider(),
        recordingStoredInR2: isRecordingStoredInR2(meeting.recordingUrl),
        recordingStorageKey: meeting.recordingUrl,
        recordingUrl,
        duration,
        botStatus: normalizeBotStatus(meeting),
        actionItems: normalizeActionItems(meeting.actionItems),
        highlights: normalizeHighlights(meeting.highlights ?? meeting.keyPoints),
        transcript: {
            entries: transcriptEntries,
        },
    };
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const user = await getOrCreateUser(userId);

        const meetingDoc = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", id), Query.limit(1)]
        );

        if (meetingDoc.total === 0) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const meeting = meetingDoc.documents[0] as any;

        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const serializedMeeting = await serializeMeeting(meeting);

        return NextResponse.json({
            success: true,
            data: {
                meeting: serializedMeeting,
                transcript: serializedMeeting.transcript,
            },
        });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        return NextResponse.json(
            { error: "Failed to fetch meeting" },
            { status: 500 }
        );
    }
}

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const user = await getOrCreateUser(userId);

        const meetingDoc = await databases.listDocuments(
            APPWRITE_IDS.databaseId,
            APPWRITE_IDS.meetingsCollectionId,
            [Query.equal("$id", id), Query.limit(1)]
        );

        if (meetingDoc.total === 0) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const meeting = meetingDoc.documents[0] as any;

        if (meeting.userId !== user.$id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const result = await invokeMeetingProcessor(
            meeting.$id,
            meeting.recordingUrl || "",
            undefined
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error("Processing error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Processing failed" },
            { status: 500 }
        );
    }
}
