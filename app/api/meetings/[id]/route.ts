import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { databases, Query } from "@/lib/appwrite.server";
import { APPWRITE_IDS } from "@/lib/appwrite-config";
import { getOrCreateUser } from "@/lib/user";
import { invokeMeetingProcessor } from "@/lib/aws";

/**
 * GET /api/meetings/[id]
 * Get meeting details with transcript
 */
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

        return NextResponse.json({
            success: true,
            data: { meeting, transcript: meeting.transcript },
        });
    } catch (error) {
        console.error("Error fetching meeting:", error);
        return NextResponse.json(
            { error: "Failed to fetch meeting" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/meetings/[id]/process
 * Trigger Lambda processing for a meeting
 */
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
